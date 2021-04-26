# NoSQLite3

A single file NoSQL database for Node.js, utilizing the Java library [NoSQLite](https://github.com/Aarkan1/nosqlite).

It's a lightweight embedded document database, ideal for small web applications.

**It features:**
- Embedded key-value object store
- Single file store
- Very fast and lightweight MongoDB like API
- Full text search capability
- Observable store

```js
const { collection } = require('nosqlite3');

let john = {
  name: 'John Doe',
  age: 32
};

// save john to the users-collection
await collection("users").save(john); 

// get all users
let users = await collection("users").find();  
```

## Requirements
Requires at least Java version 8 at "JAVA_HOME" path. 

If you don't have a Java Runtime Environment you can download it [here](https://www.oracle.com/se/java/technologies/javase-jre8-downloads.html).

## Table of content
- [Installation](#installation)
- [Getting started](#getting-started)
- [Document](#document)
- [Observe collection](#observe-collection)
- [Collection methods](#collection-methods)
  - [List all collections](#list-all-collections)
  - [Filters](#filters)
  - [FindOptions](#findoptions)
- [Collection Examples](#collection-examples)
- [Filter nested objects](#filter-nested-objects)
- [CollectionConfig](#collectionconfig)

## Installation

```bash
npm install nosqlite3
```

## Getting started
Collections is used with the `collection()`-method to manipulate the database.
**collection()** takes a collection-name as parameter. Each collection stores data separately. 
If **collection()** is used without a name, it defaults to a 'default_coll' collection.
All calls to the database are asynchronous, so you need to *await* the response.

First call to **collection()** will initiate a database connection.
The first time it will create a database-file in your project. Easy to deploy or share. 

### Examples
```js
const { collection, Filter } = require('nosqlite3');

let john = new users("John");

// generates an UUID like: "lic4XCz2kxSOn4vr0D8BV"
await collection("users").save(john);    

let jane = await collection("users").findById("lic4XCz2kxSOn4vr0D8BV");

jane.setAge(30);

// updates document with same UUID
await collection("users").save(jane); 

// delete Jane
await collection("users").deleteById("lic4XCz2kxSOn4vr0D8BV"); 

// get all users
let users = await collection("users").find(); 

// get all users named 'John'
let usersNamedJohn = await collection("users").find(Filter.eq("name", "John"));

// or with the statement syntax
let usersNamedJohn = await collection("users").find("name==John"); 
```

## Document
Collections can be used as a simple key/value store, but it's true potential is when using it with document objects.
When using objects the property `_id` is used to identify the object in the database. 

If there's no `_id` when saving a document, it gets created with a generated UUID.

If it's present, the document with matching id in the collection gets updated.

```js
const { collection } = require('nosqlite3');

let user = {
  name: 'John',
  age: 32
}

// save without _id
await collection("users").save(user);

// user now has the property '_id'
user._id  // 'lic4XCz2kxSOn4vr0D8BV',
```

## Observe collection

You can register a callback watcher to a collection. The watcher listens on changes to that collection, and automatically triggers provided handler.

Watch a collection on changes:
```js
// watchData has 3 fields. 
// model - is the document class that was triggered 
// event - is the event triggered - 'insert', 'update' or 'delete'
// data - is a list with effected documents
collection("users").watch(watchData => {
    let effectedUsers = watchData.data;

    switch(watchData.event) {
        case "insert": // on created document
        break;

        case "update": // on updated document
        break;

        case "delete": // on deleted document
        break;
    }
});
```

Watch a collection on changes on a specific event:
```js
collection("users").watch("insert", watchData => {
    let effectedUsers = watchData.data;
    // do logic with inserted documents
});

collection("users").watch("update", watchData => {
    let effectedUsers = watchData.data;
    // do logic with updated documents
});

collection("users").watch("delete", watchData => {
    let effectedUsers = watchData.data;
    // do logic with deleted documents
});
```

## Collection methods

To use the collection you need to add which document to query for in the collection parameter, ex `collection("users")` will only query for Users.
Data is stored in the collection as JSON, and the `find()`-methods will by default parse this JSON.

Setting a collection to `parse: false` is MUCH MUCH faster, because no parsing is required. This is good when only sending data from a collection directly over the network.

**Table 1. Collection methods**

| Operation | Method | Description |
| --- | --- | --- |
| Get all documents | find(Filter) | Returns a list with objects. If no filter is used find() will return ALL documents. |
| Get one document | findOne(Filter) | Returns first found document. |
| Get document with id | findById(id) | Returns the object with matching id. |
| Create or Update a document | save(Object) | Creates a new document in the collection if no id is present. If theres an id save() will update the existing document in the collection. Can save an array of documents. |
| Update documents | updateField(fieldName, newValue) | Update all documents fields with new value. |
| Update a document field with Object | updateField(Object, fieldName, newValue) | Updates the document field with matching id. |
| Update a document field with id | updateFieldById(id, fieldName, newValue) | Updates the document field with matching id. |
| Update documents | changeFieldName(newFieldName, oldFieldName) | Change field name on all documents. |
| Update documents | removeField(fieldName) | Removes field from all documents. |
| Delete a document | delete(Document) | Deletes the document with matching id. |
| Delete documents | delete(Filter) | Deletes all documents matching the filter. |
| Delete a document with id | deleteById(id) | Deletes the document with matching id. |
| Get number of documents | count() | Returns the count of all documents in a collection. |
| Watch a collection | watch(callback) | Register a watcher that triggers on changes in the collection. |
| Watch a collection on an event | watch(event, callback) | Register a watcher that triggers on changes at target event in the collection. |

**Table 1.2. Collection as a key/value store methods**

When using the collection as a key/value store you can save any data you want.

Note: you can't filter with `find()` when storing raw data.
```js
await collection("randomData").put("snuggles", { name: "Snuggles" });
await collection("randomData").put("1+2", 3);

let snuggles = await collection("randomData").get("snuggles");
```

| Operation | Method | Description |
| --- | --- | --- |
| Get value by key | get(key) | Returns an object as JSON. |
| Store object at key | put(key, value) | Stores the value as JSON at target key. Replaces value if key exists. |
| Store object at key | putIfAbsent(key, value) | Stores the value as JSON at target key. Does not replace value if key exists. |
| Remove value by key | remove(key) | Removes both key and value. |


### List all collections
The method `collectionNames()` returns a list of all different collections currently stored.

```js
const { collectionNames } = require('nosqlite3');

let collections = collectionNames();
```

### Filters

Filter are the selectors in the collection’s find operation. It matches documents in the collection depending on the criteria provided and returns a list of objects.

```js
const { Filter } = require('nosqlite3');

Filter.eq('field', 'value');

// or with deconstruct
const { eq } = Filter;

eq('field', 'value');
```

**Table 2. Comparison Filter**

| Filter | Method | Description |
| --- | --- | --- |
| Equals | eq(Field, Object) | Matches values that are equal to a specified value. |
| NotEquals | ne(Field, Object) | Matches values that are not equal to a specified value. |
| Greater | gt(Field, Object) | Matches values that are greater than a specified value. |
| GreaterEquals | gte(Field, Object) | Matches values that are greater than or equal to a specified value. |
| Lesser | lt(Field, Object) | Matches values that are less than a specified value. |
| LesserEquals | lte(Field, Object) | Matches values that are less than or equal to a specified value. |
| In | in(Field, ...Objects) | Matches any of the values specified in an array. |

**Table 3. Logical Filters**

| Filter | Method | Description |
| --- | --- | --- |
| Not | not(Filter) | Inverts the effect of a filter and returns results that do not match the filter. |
| Or | or(...Filter) | Joins filters with a logical OR returns all ids of the documents that match the conditions of either filter. |
| And | and(...Filter) | Joins filters with a logical AND returns all ids of the documents that match the conditions of both filters. |

**Table 4. Text Filters**

| Filter | Method | Description |
| --- | --- | --- |
| Text | text(Field, String) | Performs full-text search. Same syntax as [SQL LIKE](https://www.w3schools.com/sql/sql_like.asp) |
| Regex | regex(Field, Regex) | Selects documents where values match a specified regular expression. |

### FindOptions

A FindOptions is used to specify search options. It provides pagination as well as sorting mechanism.
The config syntax with an object is more clear and easier to read.

Example
```js
// find(filter, sortBy, limit, offset)

// sorts all documents by age in ascending order then take first 10 documents and return as a List
let users = await collection("users").find(null, "age=asc", 10, 0);

// or with FindOptions
let users = await collection("users").find({
  sortBy: "age=asc",
  limit: 10
});
```

```js
// sorts the documents by age in descending order
let users = await collection("users").find(null, "age=desc", 0, 0);

// or with FindOptions
let users = await collection("users").find({
  filter: "age=desc"
});
```

```js
// fetch 10 documents starting from offset = 2
let users = await collection("users").find(10, 2);

// or with FindOptions
let users = await collection("users").find({
  limit: 10,
  offset: 2
});
```

## Collection Examples

These examples uses the deconstructed Filter syntax
```js
const { collection, Filter } = require('nosqlite3');

// with deconstruction of Filter methods
const { eq, ne, gt, gte, lt, lte, not, and, or, text, regex } = Filter;

// 'in' is a reserved keywords, and cannot be deconstructed
Filter.in(); // filter from a list
```

**and()**
```js
// matches all documents where 'age' field has value as 30 and
// 'name' field has value as John Doe
await collection("users").find(and(eq("age", 30), eq("name", "John Doe")));
// with the statement syntax
await collection("users").find("age==30 && name==John Doe");
```

**or()**
```js
// matches all documents where 'age' field has value as 30 or
// 'name' field has value as John Doe
await collection("users").find(or(eq("age", 30), eq("name", "John Doe")));
// with the statement syntax
await collection("users").find("age==30 || name==John Doe");
```

**not()**
```js
// matches all documents where 'age' field has value not equals to 30
// and name is not John Doe
await collection("users").find(not(and((eq("age", 30), eq("name", "John Doe"))));
// with the statement syntax
await collection("users").find("!(age==30 && name==John Doe)");
```

**eq()**
```js
// matches all documents where 'age' field has value as 30
await collection("users").find(eq("age", 30));
// with the statement syntax
await collection("users").find("age==30");
```

**ne()**
```js
// matches all documents where 'age' field has value not equals to 30
await collection("users").find(ne("age", 30));
// with the statement syntax
await collection("users").find("age!=30");
```

**gt()**
```js
// matches all documents where 'age' field has value greater than 30
await collection("users").find(gt("age", 30));
// with the statement syntax
await collection("users").find("age>30");
```

**gte()**
```js
// matches all documents where 'age' field has value greater than or equal to 30
await collection("users").find(gte("age", 30));
// with the statement syntax
await collection("users").find("age>=30");
```

**lt()**
```js
// matches all documents where 'age' field has value less than 30
await collection("users").find(lt("age", 30));
// with the statement syntax
await collection("users").find("age<30");
```

**lte()**
```js
// matches all documents where 'age' field has value lesser than or equal to 30
await collection("users").find(lte("age", 30));
// with the statement syntax
await collection("users").find("age<=30");
```

**in()**
```js
// matches all documents where 'age' field has value in [20, 30, 40]
await collection("users").find(Filter.in("age", 20, 30, 40));

List ages = List.of(20, 30, 40);
await collection("users").find(Filter.in("age", ages));

// with the statement syntax
await collection("users").find("age==[20, 30, 40]");
```


**text()**
Same syntax as [SQL LIKE](https://www.w3schools.com/sql/sql_like.asp)
* The percent sign (%) represents zero, one, or multiple characters
* The underscore sign (_) represents one, single character

```js
// matches all documents where 'address' field start with "a"
await collection("users").find(text("address", "a%"));

// with the statement syntax, applies to all text() examples
await collection("users").find("address=~a%");

// matches all documents where 'address' field end with "a"
await collection("users").find(text("address", "%a"));

// matches all documents where 'address' field have "or" in any position
await collection("users").find(text("address", "%or%"));

// matches all documents where 'address' field have "r" in the second position
await collection("users").find(text("address", "_r%"));

// matches all documents where 'address' field start with "a" and are at least 2 characters in length
await collection("users").find(text("address", "a_%"));

// matches all documents where 'address' field start with "a" and are at least 3 characters in length
await collection("users").find(text("address", "'a__%"));

// matches all documents where 'address' field start with "a" and ends with "o"
await collection("users").find(text("address", "a%o"));
```

**regex()**
Pass regex as a string.
```js
// matches all documents where 'name' value starts with 'jim' or 'joe'.
await collection("users").find(regex("name", "^(jim|joe).*"));
// with the statement syntax
await collection("users").find("name~~^(jim|joe).*");
```

## Filter nested objects

It's just as easy to filter nested objects in a collection. Each nested property is accessible with a dot-filter for each level.

```js
// matches all documents where a User's cat has an age of 7
await collection("users").find(eq("cat.age", 7));
// with the statement syntax
await collection("users").find("cat.age==7");

// matches all documents where a User's headphone has a brand of Bose
await collection("users").find(eq("accessory.headphones.brand", "Bose"));
// with the statement syntax
await collection("users").find("accessory.headphones.brand==Bose");
```

### CollectionConfig
CollectionConfig can be passed when enabling collections to set certain options.
Options available are:
- *dbPath* - The default path is "db/data.db". You can override that with this option. 
- *parse* - IF true, automatically parse all JSON-data from the database. 

**Note:** options must be called before any other call with collection()! 

You can pass one or multiple options when enabling collections:
```js
// default options 
let config = {
  dbPath: 'db/data.db',
  parse: true
};

collection(config);
```
