'use strict'
const mysql = require('mysql');
const config = require('./config/config.json');

const con = mysql.createConnection({
  host: config.db_host,
  user: config.db_user,
  database: config.db_database,
  password: config.db_password,
});

con.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
  
});

con.query("SELECT * FROM `nakruti`", function (error, results) {
  if (error) throw error;
  //console.dir(results)
  console.log('The solution is: ', results[0]);
});