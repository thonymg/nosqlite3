/**
 * @author Johan Wirén
 */

const NOSQLITE_VERSION = '1.0.3'

const java = require('java')
const { isObject } = require('./libs/utils')
java.classpath.push(__dirname + '/nosqlite-' + NOSQLITE_VERSION + '.jar')

const Collection = require('./libs/Collection')
const Filter = require('./libs/Filter')

// local variables
let hasInitialized = false
let hasStarted = false
const collections = {}
const collectionNames = []

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
  if(hasStarted || hasInitialized) return
  hasStarted = true

  Object.assign(defaultConfig, config)

  const Database = java.import('nosqlite.Database')
  java.setStaticFieldValue('nosqlite.Database', "runAsync", false)
  java.setStaticFieldValue('nosqlite.Database', "dbPath", defaultConfig.dbPath)

  const collection = Database.collection
  collection()

  const collNames = java.callStaticMethodSync('nosqlite.Database', 'collectionNames')

  for(let coll of collNames.toArray()) {
    collectionNames.push(coll)
    collections[coll] = new Collection(collection(coll), defaultConfig.parse, coll)
  }

  // Java shutdown hook
  const ShutdownHookHelper = java.import('nosqlite.utilities.ShutdownHookHelper');
  ShutdownHookHelper.setShutdownHook(java.newProxy('java.lang.Runnable', {
    run: function() {
      // console.log("\nJVM shutting down\n");
    }
  }));

  hasInitialized = true
}

module.exports = {
  Filter,
  collectionNames() {
    if(!hasInitialized) initCollection()
    return collectionNames
  },
  collection(coll = 'default_coll') {
    if(!hasInitialized) {
      if(isObject(coll)) initCollection(coll)
      else initCollection()
    }

    if(hasInitialized && !collections[coll]) {
      let Database = java.import('nosqlite.Database')
      let collection = Database.collection
      collections[coll] = new Collection(collection(coll), true, coll)
    }

    return collections[coll]
  }
}
