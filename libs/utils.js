const java = require('java')

// recursive converter
function objectToJavaHashMap(object) {
  let map = java.newInstanceSync('java.util.HashMap')

  Object.entries(object).forEach(([key, value]) => {
    if(isObject(value)) {
      value = objectToJavaHashMap(value)
    } 
    else if(Array.isArray(value)) {
      let list = java.newInstanceSync('java.util.ArrayList')
      value.forEach(val => list.add(objectToJavaHashMap(val)))
      value = list
    } 

    map.put(key, value)
  })

  return map
}

function isObject(o) {
  return o instanceof Object && o.constructor === Object;
}

function workerize (fn, workerOptions = {}) {
  const { Worker } = require('worker_threads')
  
  /**
   * Workerized function
   * 
   * @function workerized
   * @param {any} workerData Any data type supported by https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Structured_clone_algorithm
   * @returns {Promise<any>} Result returned by function workerFn when it exists
   * @async
   */
  return function workerized (...workerData) {
    return new Promise((resolve, reject) => {
      const worker = new Worker(`
        const { workerData, parentPort } = require('worker_threads')
        Promise.resolve((${fn.toString()})(...workerData)).then(returnedData => {
          parentPort.postMessage(returnedData)
        })
      `, { ...workerOptions, eval: true, workerData })
  
      worker.on('message', resolve)
      worker.on('error', reject)
      worker.on('exit', code => {
        if (code === 0) {
          resolve(null)
        } else {
          reject(new Error(`Worker stopped with exit code ${code}`))
        }
      })
    })
  }
}

module.exports = {
  objectToJavaHashMap,
  workerize
}