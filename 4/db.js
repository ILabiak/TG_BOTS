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

//let arr =await getUserOrders(868619239)
//console.dir(await getUserBalance(868619239))
console.dir(await addUserToDB(868619231,'frozzz'))

  })()

async function sqlRequest(sql){
  let res;
  const promise = new Promise(function(resolve, reject){
    con.query(
      sql, 
        function(err, rows){                                                
            if(err){
              console.dir(err)
                reject(new Error("Error!!!"));
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


async function getUserOrders(telegram_id){
  let sql = `SELECT order_ids FROM \`nakruti\` WHERE \`telegram_id\` = ${telegram_id.toString()}`;
  let res = await(sqlRequest(sql))
  return eval(res[0].order_ids)
}

async function getUserBalance(telegram_id){
  let sql = `SELECT balance FROM \`nakruti\` WHERE \`telegram_id\` = ${telegram_id.toString()}`;
  let res = await(sqlRequest(sql))
  return eval(res[0].balance)
}

async function addUserToDB(telegram_id,username){
  let checkidtext =  `SELECT * FROM \`nakruti\` WHERE \`telegram_id\` = ${telegram_id.toString()}`;
  let checkid = await(sqlRequest(checkidtext))
  if(!checkid[0]){
    let sql = `INSERT INTO \`nakruti\` (\`id\`, \`telegram_id\`, \`username\`, \`api_token\`, \`balance\`, \`order_ids\`) VALUES (NULL, ${telegram_id.toString()}, \'${username}\', \'\', \'\', \'[]\');`
    let res = await(sqlRequest(sql))
    if(res.affectedRows ==1) return true;
  }
return false;
}