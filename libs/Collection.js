/**
 * @author Johan Wirén
 */

const java = require('java')
const { nanoid } = require('nanoid')
const { isObject } = require('./utils')

let defaultFindOptions = {
  filter: null,
  sort: null,
  limit: 0,
  offset: 0
}

module.exports = class Collection {
  constructor(coll, parse = true, collName) {
    this.coll = coll
    this.parse = parse
    this.collName = collName
    this.watchers = []
    this.eventWatchers = {}
  }

  async get(key) {
    return this.findById(key)
  }

  async put(key, value) {
    let event = 'insert'
    let exists = await this.findById(key)
    if(!!exists) event = 'update'

    this._updateWatchers(event, {[key]: value})
    
    // don't stringify JSON
    if(typeof value != 'string') {
      value = JSON.stringify(value)
    }

    return this.coll.putAsync(key, value)
  }
  
  async putIfAbsent(key, value) {
    let exists = await this.findById(key)
    if(!!exists) return `'${key}' already exists`

    return this.put(key, value)
  }

  async remove(key) {
    let doc = await this.findById(key)
    this._updateWatchers('delete', doc)

    return this.coll.removeAsync(key)
  }

  async find(filter = null, sortBy = null, limit = 0, offset = 0) {
    let args = [filter, sortBy, limit, offset]
    if(isObject(filter)) {
      Object.assign(defaultFindOptions, filter)
      args = Object.values(defaultFindOptions)
    }
    if(this.parse) return JSON.parse(await this.coll.findAsJsonAsync(...args))
    return this.coll.findAsJsonAsync(...args)
  }

  async findOne(filter) { 
    if(this.parse) return JSON.parse(await this.coll.findOneAsJsonAsync(filter))
    return this.coll.findOneAsJsonAsync(filter)
  }

  async findById(id) { 
    if(this.parse) return JSON.parse(await this.coll.findByIdAsJsonAsync(id))
    return this.coll.findByIdAsJsonAsync(id)
  }

  async save(doc) {
    let event = 'insert'

    if(Array.isArray(doc)) {
      let list = java.newInstanceSync('java.util.ArrayList')
      doc.forEach(d => {
        if(d._id) event = 'update'
        d._id = d._id || nanoid()
        list.add(JSON.stringify(d))
      })
      
      this._updateWatchers(event, doc)
      
      await this.coll.saveManyAsync(list.toArray())
      return doc
    }

    let exists = await this.findById(doc._id || '')
    if(!!exists) event = 'update'

    doc._id = doc._id || nanoid()
    this._updateWatchers(event, doc)

    if(this.parse) return JSON.parse(await this.coll.putAsync(doc._id, JSON.stringify(doc)))
    return this.coll.putAsync(doc._id, JSON.stringify(doc))
  }

  async delete(filter) {
    if(filter && filter._id) {
      return this.deleteById(filter._id)
    }

    let doc = filter ? await this.coll.deleteAsync(filter) : await this.coll.deleteAsync()
    this._updateWatchers('delete', doc)

    if(!!doc && filter && this.parse) return JSON.parse(doc)
    else return doc
  }

  async deleteOne(filter) {
    let doc = await this.coll.deleteOneAsync(filter)
    this._updateWatchers('delete', doc)

    if(!!doc && this.parse) return JSON.parse(doc)
    else return doc
  }

  async deleteById(id) { 
    let doc = await this.coll.deleteByIdAsync(id)
    this._updateWatchers('delete', doc)

    if(!!doc && this.parse) return JSON.parse(doc)
    else return doc
  }

  /**
   * 
   * @param  {document, field, value} args 
   * updates the document with same _id
   * 
   * @param  {filter, field, value} args 
   * updates documents matching filter
   * 
   * @param  {field, value} args 
   * updates all document with new value
   * 
   * @returns updated documents
   */
  async updateField(...args) { 
    if(args[0] && args[0]._id) {
      return this.updateFieldById(...args)
    }
    let doc = await this.coll.updateFieldAsync(...args)
    if(doc === 'same value') return

    this._updateWatchers('update', doc)

    if(this.parse && doc !== 'updated all') return JSON.parse(doc)
    else return doc
  }

  async updateFieldById(id, field, value) { 
    let doc = await this.coll.updateFieldByIdAsync(id, field, value)
    if(doc === 'same value') return

    this._updateWatchers('update', doc)

    if(this.parse) return JSON.parse(doc)
    else return doc
  }

  async changeFieldName(newField, oldField) { 
    return this.coll.changeFieldName(newField, oldField)
  }

  async removeField(field) { 
    return this.coll.removeFieldAsync(field)
  }

  // manually set watchers
  watch(event, handler) { 
    if(event.constructor === Function) {
      this.watchers.push(event)
    } else {
      if(!this.eventWatchers[event]) this.eventWatchers[event] = []
      this.eventWatchers[event].push(handler)
    }
  }

  count() { 
    return this.coll.count()
  }

  _updateWatchers(event, data) {
    if([null, 'deleted', 'updated all', '[null]', '[]'].includes(data)) return // don't update when deleting a whole collection
    setTimeout(() => {
      const watchData = {
        event,
        model: this.collName,
        data: (typeof data === 'string') ? JSON.parse(data) : data
      }

      for(let handler of this.watchers) {
        handler(watchData)
      }
      
      if(this.eventWatchers[event]) {
        for(let handler of this.eventWatchers[event]) {
          handler(watchData)
        }
      }
    }, 10);
  }
}
