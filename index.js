const java = require('java')
const maven = require('node-java-maven')
const Collection = require('./Collection')
let hasInitialized = false
let startedInit = false
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
  return new Promise((resolve, reject) => {
    if(hasInitialized) return resolve()
    if(startedInit) return
    
    maven(function(err, mavenResults) {
      startedInit = true
      if (err) {
        return console.error('could not resolve maven dependencies', err)
      }

      mavenResults.classpath.forEach(function(c) {
        // console.log('adding ' + c + ' to classpath') // debug
        java.classpath.push(c)
      });

      Object.assign(defaultConfig, config)
      
      let Database = java.import('nosqlite.Database')
      java.setStaticFieldValue('nosqlite.Database', "runAsync", false)
      java.setStaticFieldValue('nosqlite.Database', "dbPath", defaultConfig.dbPath)

      let collection = Database.collection
      collection()

      let collectionNames = java.callStaticMethodSync('nosqlite.Database', 'collectionNames')

      for(let coll of collectionNames.toArray()) {
        collections[coll] = new Collection(collection(coll), defaultConfig.parse)
      }

      hasInitialized = true
      resolve()
    })
  })
}

module.exports = {
  initCollection, 
  collection(coll = '_default_coll') {
    if(!hasInitialized) initCollection()

    if(hasInitialized && !collections[coll]) {
      let Database = java.import('nosqlite.Database')
      let collection = Database.collection
      collections[coll] = new Collection(collection(coll))
    }

    return collections[coll]
  }
}
