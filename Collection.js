const java = require('java')
const { nanoid } = require('nanoid')

module.exports = class Collection {
  constructor(coll, parse = true) {
    this.coll = coll
    this.parse = parse
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
    if(Array.isArray(doc)) {
      let list = java.newInstanceSync('java.util.ArrayList')
      doc.forEach(d => {
        d._id = d._id || nanoid()
        list.add(JSON.stringify(d))
      })
      if(this.parse) return JSON.parse(await this.coll.saveManyAsync(list.toArray()))
      return this.coll.saveManyAsync(list.toArray())
    }
    doc._id = doc._id || nanoid()
    if(this.parse) return JSON.parse(await this.coll.putAsync(doc._id, JSON.stringify(doc)))
    return this.coll.putAsync(doc._id, JSON.stringify(doc))
  }

  async delete(...args) { 
    if(args[0] && args[0]._id) {
      return this.deleteById(args[0]._id)
    }
    if(args[0] && this.parse) return JSON.parse(await this.coll.deleteAsync(...args))
    return this.coll.deleteAsync(...args)
  }

  async deleteById(id) { 
    if(this.parse) return JSON.parse(await this.coll.deleteByIdAsync(id))
    return this.coll.deleteByIdAsync(id)
  }

  async updateField(...args) { 
    if(this.parse) return JSON.parse(await this.coll.updateFieldAsync(...args))
    return this.coll.updateFieldAsync(...args)
  }

  async updateFieldById(...args) { 
    if(this.parse) return JSON.parse(await this.coll.updateFieldByIdAsync(...args))
    return this.coll.updateFieldByIdAsync(...args)
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
  watch(...args) { 
    return this.coll
  }

  async count() { 
    return await this.coll.countAsync()
  }
}
