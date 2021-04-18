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

module.exports = {
  objectToJavaHashMap
}