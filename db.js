var mysql      = require('mysql');
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : 'jinjinjin',
  database : 'hongbao'
});

connection.connect();

connection.query('SELECT * from ele_user', function (error, results, fields) {
  if (error) throw error;
  console.log('The length is: ', results.length);
});

connection.end();