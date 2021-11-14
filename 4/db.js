'use strict'
const mysql = require('mysql');
const config = require('./config/config.json');

const con = mysql.createConnection({
  host: config.db_host,
  user: config.db_user,
  database: config.db_database,
  password: config.db_password,
});

(async() =>{
  await con.connect(function(err) {
    if (err) throw err;
    console.log("Connected!");
    
  });

const text = "SELECT order_ids FROM `nakruti` WHERE `telegram_id` = 868619239"

console.dir(await sqlRequest(text))

  })()

async function sqlRequest(sql){
  let res;
  const promise = new Promise(function(resolve, reject){
    con.query(
      sql, 
        function(err, rows){                                                
            if(rows === undefined){
                reject(new Error("Error rows is undefined"));
            }else{
                resolve(rows);
            }
        }
    )}
)
  await promise.then(function(results){
    res = results;
  })
  return res;
}