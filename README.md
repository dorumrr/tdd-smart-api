# TDD Smart API #
*A Plug&Play TDD API that requires no endpoints writing.*

---

### Dependencies ###

- NodeJS
- A MySQL database

### Set it up ###

Clone or download the repository, navigate to its location and run `npm install` to setup dependencies.

Edit server.js file and set your database credentials:
```
...
var useAuthorizationMiddleware = false; //true or false
var AuthorizationMiddlewareKey = 'KeyIsSafeWhenUsingHTTPS';
...
  host: 'databaseHost',
  user: 'databaseUser',
  password: 'databasePass',
  database: 'databaseName',
...
```

In case you do not have `supevisor` installed globally, run `npm install -g supervisor`. Any other watcher will do just fine (NodeMon, Forever, PM2).

Start the server using `supervisor server.js`. You can use `npm start`, but you'll have to restart every time you make a change on server.js file.

---

### Usage examples: ###

*Parameters must be sent into an object.*

*When useAuthorizationMiddleware is set to true, you must send in headers key Authorization with your defined AuthorizationMiddlewareKey as a value*

* From an AngularJS application (with Authorization):
```
var req = {
 method: 'POST',
 url: 'http://url.to.api',
 headers: {
   'Authorization': 'KeyIsSafeWhenUsingHTTPS'
 },
 data: { dbTable:'notes', dbColVal:{ author:'Doru Moraru', title:'First note', content:'My very first note is here, ready to be served.' } }
}

$http(req).then(function(){...}, function(){...});
```

##### GET parameters object example: #####
```
{
    dbTable:'notes',
    dbColVal:{
        id:'0',
        author:'Doru'
    },
    dbColValOperator:{
        id: '>',
        author:'LIKE'
    }
    dbLimit:'10'
    dbOffset:'0'
}
```
---

##### POST parameters object example: #####
```
{
    dbTable:'notes',
    dbColVal:{
        author:'Doru Moraru',
        title:'First note',
        content:'My very first note is here, ready to be served.'
    }
}
```
---

##### PATCH parameters object example: ####
```
{
    dbTable:'notes',
    dbColVal:{
        author:'Doru Moraru',
    }
    dbWhere: {
        id:'2',
        name:'Doru Moraru'
    }
    dbWhereOperator:{
        name:'!='
    }
}
```
---

#### DELETE parameters object example: ####
```
{
    dbTable:'notes',
    ...
}
```
---

### Limitations: ###

* Authentication module is rudimentary and unsafe!

* Single SQL transaction methods:
   * PATCH (update) multiple columns, but one table at a time (query: *UPDATE mytable SET col=val, col2=val2, col3=val3 ...* )
   * POST one item at a time (query: *INSERT INTO mytable (col, col2, col3 ...) VALUES(val1, val2, val3 ...)* )
   * DELETE one item at a time (query: *DELETE FROM mytable WHERE col1=val1 AND col2=val2 ...* )

* Aliasing is not possible
* Tables JOIN is not possible
