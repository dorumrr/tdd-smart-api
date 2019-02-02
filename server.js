var mysql = require('mysql');
var restify = require('restify');
restify.pre.sanitizePath();

var useAuthorizationMiddleware = false; // true | false
var AuthorizationMiddlewareKey = 'KeyIsSafeWhenUsingHTTPS';

//mysql
var connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'demoapi',
  multipleStatements: true
});

connection.connect(function (err) {
  if (err) throw err;
  console.log("Connection to MySQL database was successful.")
});

//prepare the server
var server = restify.createServer({ name: 'TDD SMART API' });
restify.CORS.ALLOW_HEADERS.push('Accept-Encoding', 'Accept-Language', 'Authorization');
server.use(restify.acceptParser(server.acceptable));
server.use(restify.queryParser());
server.use(restify.bodyParser());
server.use(restify.CORS());

//Rudimentary authentication middleware
if (useAuthorizationMiddleware === true) {
  server.use(function (req, res, next) {
    var authorization = req.headers['authorization']; //console.log(authorization);
    if (authorization != AuthorizationMiddlewareKey) {
      res.send(401, { ERROR: 'Key is not valid.' })
    }
    next();
  });
}

// ##################### BEGIN ROUTES ####################################### //

server.get('/', function (req, res, next) {
  var dbTable = "undefined" === typeof (req.params.dbTable) ? res.send(200, { ERROR: 'MySQL database table name (dbTable) is missing from object.' }) : req.params.dbTable;
  var dbLimit = "undefined" === typeof (req.params.dbLimit) ? 10 : req.params.dbLimit;
  var dbOffset = "undefined" === typeof (req.params.dbOffset) ? '0' : req.params.dbOffset;
  var dbColVal = "undefined" === typeof (req.params.dbColVal) ? {} : req.params.dbColVal;
  var dbColValOperator = "undefined" === typeof (req.params.dbColValOperator) ? {} : req.params.dbColValOperator;

  var params = [];
  var sql = "SELECT * FROM ?? ";
  params.push(dbTable);

  if (Object.keys(dbColVal).length !== 0 /*&& Object.constructor === Object*/) {
    sql += " WHERE ";
    for (col in dbColVal) { //console.log(col, dbColVal[col]);
      sql += " ?? ";
      params.push(col);

      if (Object.keys(dbColValOperator).length !== 0 /*&& Object.constructor === Object*/) {
        for (op in dbColValOperator) { //console.log(op, dbColValOperator[op])
          if (op == col) {
            sql += " " + dbColValOperator[op] + " ";
          } else {
            sql += " = ";
          }
        }
      } else {
        sql += " = ";
      }

      sql += " ? AND";
      params.push(dbColVal[col]);

    }
    sql = sql.slice(0, -3);
  }

  sql += " LIMIT " + dbLimit;
  sql += " OFFSET " + dbOffset;

  var sqlSafe = mysql.format(sql, params); //console.log(sqlSafe);
  connection.query(sqlSafe, function (error, results, fields) {
    if (error) {
      res.send(200, { API: 'Error executing MySQL query : ' + sqlSafe, Details: error, Fields: fields });
    } else {
      res.send(200, { success: true, query: sqlSafe, results: results, fields: fields });
    }
  });
});

// ---------------------------

server.post('/', function (req, res, next) {
  var dbTable = "undefined" === typeof (req.params.dbTable) ? res.send(200, { ERROR: 'MySQL database table name (dbTable) is missing from object. See README.md for an example' }) : req.params.dbTable;
  var dbColVal = "undefined" === typeof (req.params.dbColVal) ? {} : req.params.dbColVal;

  var params = [];
  var sql = " INSERT INTO ?? ( ";
  params.push(dbTable);

  for (var col in dbColVal) { //console.log(col, dbColVal[col]);
    sql += "??,";
    params.push(col);
  }
  sql = sql.slice(0, -1);

  sql += " ) VALUES (";
  for (var col in dbColVal) { //console.log(col, dbColVal[col]);
    sql += "?,";
    params.push(dbColVal[col]);
  }
  sql = sql.slice(0, -1);

  sql += " ); ";

  var sqlSafe = mysql.format(sql, params); //console.log(sqlSafe);
  connection.query(sqlSafe, function (error, results, fields) {
    if (error) {
      res.send(200, { API: 'Error executing MySQL query : ' + sqlSafe, Details: error, Fields: fields });
    } else {
      res.send(200, { success: true, query: sqlSafe, results: results, fields: fields });
    }
  });
});

// ---------------------------

server.patch('/', function (req, res, next) {
  var dbTable = "undefined" === typeof (req.params.dbTable) ? res.send(200, { ERROR: 'MySQL database table name (dbTable) is missing from object.' }) : req.params.dbTable;
  var setColVal = "undefined" === typeof (req.params.setColVal) ? res.send(200, { ERROR: 'I need at least one column and a value to perform an update.' }) : req.params.setColVal;
  var setWhere = "undefined" === typeof (req.params.setWhere) ? res.send(200, { ERROR: 'I need at least one WHERE column:value matching to perform an update. Default operator is =' }) : req.params.setWhere;
  var setWhereOperator = "undefined" === typeof (req.params.setWhereOperator) ? {} : req.params.setWhereOperator;

  var params = [];
  var sql = "UPDATE ?? ";
  params.push(dbTable);

  sql += " SET ";
  for (col in setColVal) { //console.log(col, setColVal[col]);
    sql += "?? = ?,";
    params.push(col);
    params.push(setColVal[col]);
  }
  sql = sql.slice(0, -1);

  sql += " WHERE ";
  for (whereCol in setWhere) { //console.log(whereCol, setWhere[whereCol])
    sql += "??";
    params.push(whereCol);

    if (Object.keys(setWhereOperator).length !== 0 /*&& Object.constructor === Object*/) {
      for (ope in setWhereOperator) { //console.log(whereCol, ope, setWhereOperator[ope])
        if (ope == whereCol) {
          sql += " " + setWhereOperator[ope] + " ";
        } else {
          sql += " = ";
        }
      }
    } else {
      sql += " = ";
    }

    sql += " ? AND";
    params.push(setWhere[whereCol]);
  }
  sql = sql.slice(0, -3);

  var sqlSafe = mysql.format(sql, params); //console.log(sqlSafe);
  connection.query(sqlSafe, function (error, results, fields) {
    if (error) {
      res.send(200, { API: 'Error executing MySQL query : ' + sqlSafe, Details: error, Fields: fields });
    } else {
      res.send(200, { success: true, query: sqlSafe, results: results, fields: fields });
    }
  });
});

server.del('/', function (req, res, next) {
  console.log('DELETE is ON');
});
// ---------------------------
// ---------------------------
// ---------------------------


// ##################### END ROUTES ######################################### //

server.listen(3000, "127.0.0.1", function () {
  console.log('%s has started: %s', server.name, server.url);
});