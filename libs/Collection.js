const java = require('java')
const { nanoid } = require('nanoid')

module.exports = class Collection {
  constructor(coll, parse = true, collName) {
    this.coll = coll
    this.parse = parse
    this.collName = collName
    this.watchers = []
    this.eventWatchers = {}
  }

  async find(...args) {
    if(this.parse) return JSON.parse(await this.coll.findAsJsonAsync(...args))
    return this.coll.findAsJsonAsync(...args)
  }

  async findOne(...args) { 
    if(this.parse) return JSON.parse(await this.coll.findOneAsJsonAsync(...args))
    return this.coll.findOneAsJsonAsync(...args)
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
      
      if(this.parse) return JSON.parse(await this.coll.saveManyAsync(list.toArray()))
      return this.coll.saveManyAsync(list.toArray())
    }

    if(doc._id) event = 'update'
    doc._id = doc._id || nanoid()
    this._updateWatchers(event, doc)

    if(this.parse) return JSON.parse(await this.coll.putAsync(doc._id, JSON.stringify(doc)))
    return this.coll.putAsync(doc._id, JSON.stringify(doc))
  }

  async delete(...args) { 
    if(args[0] && args[0]._id) {
      return this.deleteById(args[0]._id)
    }
    let doc = await this.coll.deleteAsync(...args)
    this._updateWatchers('delete', doc)

    if(args[0] && this.parse) return JSON.parse(doc)
    else return doc
  }

  async deleteById(id) { 
    let doc = await this.coll.deleteByIdAsync(id)
    this._updateWatchers('delete', doc)

    if(this.parse) return JSON.parse(doc)
    else return doc
  }

  async updateField(...args) { 
    let doc = await this.coll.updateFieldAsync(...args)
    this._updateWatchers('update', doc)

    if(this.parse) return JSON.parse(doc)
    else return doc
  }

  async updateFieldById(...args) { 
    let doc = await this.coll.updateFieldByIdAsync(...args)
    this._updateWatchers('update', doc)

    if(this.parse) return JSON.parse(doc)
    else return doc
  }

  async changeFieldName(...args) { 
    if(this.parse) return JSON.parse(await this.coll.changeFieldName(...args))
    return this.coll.changeFieldName(...args)
  }

  async removeField(field) { 
    if(this.parse) return JSON.parse(await this.coll.removeFieldAsync(field))
    return this.coll.removeFieldAsync(field)
  }

  // manually set watchers
  watch(event, handler) { 
    if(event.constructor === Function) {
      this.watchers.push(event)
    } else {
      if(!this.eventWatchers[event]) this.eventWatchers['event'] = []
      this.eventWatchers[event].push(handler)
    }
  }

  async count() { 
    return await this.coll.countAsync()
  }

  _updateWatchers(event, data) {
    if(data === 'deleted') return // don't update when deleting a whole collection
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
