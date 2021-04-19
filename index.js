const java = require('java')
const sleep = require('system-sleep')
const Collection = require('./libs/Collection')
const Filter = require('./libs/Filter')

// local variables
let hasInitialized = false
let hasStarted = false
const collections = {}

// init support for async/await syntax
java.asyncOptions = {
  asyncSuffix: undefined,   // Don't generate async callbacks
  syncSuffix: "",           // Sync methods use the base name(!!)
  promiseSuffix: "Async",   // Generate methods returning promises, using the suffix Async.
  promisify: require('util').promisify
}

let defaultConfig = {
  dbPath: 'db/data.db',
  parse: true
}

function initCollection(config = {}) {
  return new Promise(resolve => {
    if(hasStarted || hasInitialized) return resolve()
    hasStarted = true

    let maven = require('node-java-maven')
    maven(function(err, mavenResults) {
      if (err) {
        return console.error('could not resolve maven dependencies', err)
      }

      mavenResults.classpath.forEach(function(c) {
        // console.log('adding ' + c + ' to classpath') // debug
        java.classpath.push(c)
      });

      Object.assign(defaultConfig, config)

      const Database = java.import('nosqlite.Database')
      java.setStaticFieldValue('nosqlite.Database', "runAsync", false)
      java.setStaticFieldValue('nosqlite.Database', "dbPath", defaultConfig.dbPath)

      const collection = Database.collection
      collection()

      const collectionNames = java.callStaticMethodSync('nosqlite.Database', 'collectionNames')

      for(let coll of collectionNames.toArray()) {
        collections[coll] = new Collection(collection(coll), defaultConfig.parse, coll)
      }

      java.options.push('-Xrs')
      const ShutdownHookHelper = java.import('nosqlite.utilities.ShutdownHookHelper');

      ShutdownHookHelper.setShutdownHook(java.newProxy('java.lang.Runnable', {
        run: function () {
          console.log("\nJVM shutting down\n");
        }
      }));

      hasInitialized = true
      resolve()
    })
  })
}

module.exports = {
  Filter,
  initCollection, 
  collection(coll = '_default_coll') {
    if(!hasInitialized) initCollection()

    // TODO: doesn't load classes
    while(!hasInitialized) sleep(100)

    if(hasInitialized && !collections[coll]) {
      let Database = java.import('nosqlite.Database')
      let collection = Database.collection
      collections[coll] = new Collection(collection(coll))
    }

    return collections[coll]
  }
}
