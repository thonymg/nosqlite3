const { initCollection, collection, Filter } = require('./index.js')
const { objectToJavaHashMap } = require('./libs/utils.js')
const java = require('java')

// collection()

// initCollection()
// setTimeout(() => {
  
  test()
// }, 1000);
// setTimeout(() => {
  
//   test()
// }, 1000);
async function test() {
  await initCollection()
  // await initCollection({ 
  //   // dbPath: 'test/embedd.db',
  //   parse: false 
  // })

  let user = {
    name: 'Johan',
    age: 32,
    friend: {
      name: 'Elsa',
      age: 22
    },
    pets: [
        {
            name: 'Tyson'
        },
        {
            name: 'Cocos'
        },
    ],
    friends: [
      {
        name: 'Elsa',
        age: 22
      },
      {
        name: 'Elsa',
        age: 22
      },
      {
        name: 'Elsa',
        age: 22
      },
      {
        name: 'Elsa',
        age: 22
      },
      {
        name: 'Elsa',
        age: 22
      },
      {
        name: 'Elsa',
        age: 22
      },
    ]
  }

  let start = Date.now()
  let map = objectToJavaHashMap(user)
  console.log(`objectToJavaHashMap() in ${Date.now() - start}ms`);
  
  // console.log(map.get('name'));
  // console.log(map.get('pets').get(1).get('name'));
  // console.log(map.get('friend').get('name'));
  
  start = Date.now()
  JSON.stringify(user)
  console.log(`JSON.stringify() in ${Date.now() - start}ms`);
  
  let users = []

  start = Date.now()
  let list = java.newInstanceSync('java.util.ArrayList')
  for (let i = 0; i < 100; i++) {
    list.add(JSON.stringify({
      _id: 'id-' + i,
      name: 'test-' + i,
      age: i,
      cat: {
        name: 'cat-' + i
      }
    }))
  }
  console.log(`ArrayList with JSON.stringify() in ${Date.now() - start}ms`);
  
  start = Date.now()
  let list2 = java.newInstanceSync('java.util.ArrayList')
  for (let i = 0; i < 1000; i++) {
    let o = {
      // _id: 'id-' + i,
      name: 'test-' + i,
      age: i,
      cat: {
        name: 'cat-' + i
      }
    }

    users.push(o)

    list2.add(objectToJavaHashMap(o))
  }
  console.log(`ArrayList with objectToJavaHashMap() in ${Date.now() - start}ms`);
  
  // start = Date.now()
  // await collection('user').save(users)
  // console.log(`save(Array) in ${Date.now() - start}ms`);
  
  // start = Date.now()
  // for(let u of users) {
  //   // u._id = Math.random()
  //   await collection('user').save(u)
  // }
  // console.log(`save(User) * 1000 in ${Date.now() - start}ms`);

  // start = Date.now()
  // console.log(await collection('test').save({
  //       _id: "_3LV-hLWA1JskY7Pan1mT",
  //       name: 'Elsa',
  //       age: 15,
  //       cat: {
  //         name: 'Mysan'
  //       }
  //     }
  // ))
  // console.log(`save() in ${Date.now() - start}ms`);

  // start = Date.now()
  // console.log(await collection('test').find());
  // console.log(`find() in ${Date.now() - start}ms`);
  
  start = Date.now()
  let ageLT100 = await collection('user').findOne("age<100");
  // ageLT100 = JSON.parse(ageLT100)
  console.log(ageLT100);
  console.log(`find("age<100") in ${Date.now() - start}ms`);
  
  collection('test').delete()
  // start = Date.now()
  // let elsa = await collection('user').findById("id-2")
  // console.log(elsa);
  // console.log(`findById() in ${Date.now() - start}ms`);
  
  // start = Date.now()
  // elsa = await collection('user').delete(elsa)
  // console.log(elsa);
  // console.log(`deleteById() in ${Date.now() - start}ms`);
  
  // start = Date.now()
  // console.log(JSON.parse(elsa));
  // console.log(`parse in ${Date.now() - start}ms`);


  const { and, or, eq, lt } = Filter

  console.log(and(
    or(
      eq("name", "Loke"),
      eq("cat.name", "Tyson")
    ),
    lt("age", 10)
  ));

  console.log(Filter.in("name", "Loke", "Elsa", "Theo"));
  let names = ["Loke", "Elsa", "Theo"]
  console.log(Filter.in("name", names));

}



  // let collection = await loadCollection.catch(console.error)


  // console.log(await collection('test').putAsync('abc', {
  //   name: 'Loke',
  //   age: 7,
  //   cat: {
  //     name: 'Tyson'
  //   }
  // }));

  // console.log(await collection('test').putAsync('abc', JSON.stringify({
  //   name: 'Loke',
  //   age: 7,
  //   cat: {
  //     name: 'Tyson'
  //   }
  // })));
  // console.log(await collection('test').putAsync('bcd', JSON.stringify({
  //   name: 'Theo',
  //   age: 4,
  //   cat: {
  //     name: 'Cocos'
  //   }
  // })));
  // console.log(await collection('test').putIfAbsentAsync('cde', 345));
  // console.log(await collection('test').getAsync('abc'));
  // console.log(await collection('test').findAsJsonAsync());
  // console.log(await collection('test').findAsJsonAsync("name==Loke"));
  // console.log(await collection('test').findAsJsonAsync("cat.name=~%o_"));
  // console.log(await collection('test').findAsJsonAsync("age>5"));
  // console.log(await collection('test').findAsJsonAsync("age>3"));
  // console.log(await coll('test').findAsJsonAsync("cat.name==Cocos || cat.name==Tyson"));
