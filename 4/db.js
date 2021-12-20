"use strict";
const mysql = require("mysql");
const config = require("./config/config.json");

let con;
async function startDataBase() {
  con = mysql.createConnection({
    host: config.db_host,
    user: config.db_user,
    database: config.db_database,
    password: config.db_password,
  });
  await con.connect(function (err) {
    if (err) throw err;
    console.log("Connected!");
  });
}
(async () => {
  /*   await con.connect(function(err) {
    if (err) throw err;
    console.log("Connected!");
  }) */
  //let arr =await getUserOrders(868619239)
  await startDataBase();
  //console.dir(await getUserOrders(868619239))
  //console.dir(await getUserBalance(868619239))
  console.dir(await addOrder(3515,868619239, 50.5,'inst.com',112,"ПОдписчики"))
  //console.dir(await checkUserExistence(868619239))
})();


async function sqlRequest(sql) {
return new Promise(function (resolve, reject) {
    con.query(sql, function (err, rows) {
      if (err) {
        console.dir(err);
        reject(new Error("Error!!!"));
      } else {
        resolve(rows);
      }
    });
  }).then();
}

async function getUserOrders(telegram_id) {
  let sql = `SELECT * FROM \`orders\` WHERE \`user\` = ${telegram_id.toString()}`;
  let res = await sqlRequest(sql);
  return res; // returns array of objects
}
/* 
[
  RowDataPacket {
    orderId: 1122,
    user: '868619239',
    charge: 55,
    link: 'fasda.com',
    start_count: 0,
    quantity: 550,
    service: 'TEST SERVICE',
    status: 'Partial',
    remains: 50,
    created: '0000-00-00'
  },
  RowDataPacket {
    orderId: 13153,
    user: '868619239',
    charge: 35,
    link: 's0ifss.com',
    start_count: 10,
    quantity: 252,
    service: 'LOL',
    status: 'Completed',
    remains: 55,
    created: '0000-00-00'
  }
]
*/

async function getUserBalance(telegram_id) {
  let sql = `SELECT balance FROM \`nakruti\` WHERE \`telegram_id\` = ${telegram_id.toString()}`;
  let res = await sqlRequest(sql);
  return eval(res[0].balance);
}

async function addUserToDB(telegram_id, username) {
  let checkidtext = `SELECT * FROM \`nakruti\` WHERE \`telegram_id\` = ${telegram_id.toString()}`;
  let checkid = await sqlRequest(checkidtext);
  if (!checkid[0]) {
    let sql = `INSERT INTO \`nakruti\` (\`id\`, \`telegram_id\`, \`username\`, \`api_token\`, \`balance\`, \`order_ids\`) VALUES (NULL, ${telegram_id.toString()}, \'${username}\', \'\', \'\', \'[]\');`;
    let res = await sqlRequest(sql);
    if (res.affectedRows == 1) return true;
  }
  return false;
}

async function changeBalance(telegram_id, amount) {
  const balanceStr = await getUserBalance(telegram_id);
  let balance = parseFloat(balanceStr);
  balance += parseFloat(amount);
  let sql = `UPDATE \`nakruti\` SET \`balance\` = \'${balance.toString()}\' WHERE \`nakruti\`.\`telegram_id\` = ${telegram_id.toString()};`;
  let res = await sqlRequest(sql);
  if (res.changedRows == 1) return true;
  return false;
}

async function addOrder(orderId, telegram_id, charge, link, quantity, service) { // переробити
  let sql = `INSERT INTO \`orders\` (\`id\`, \`orderId\`, \`user\`, \`charge\`, \`link\`, \`start_count\`, \`quantity\`, \`service\`, \`status\`, \`remains\`, \`created\`) 
  VALUES (NULL, ${orderId.toString()}, ${telegram_id.toString()}, ${charge.toString()}, \'${link.toString()}\', \'\', ${quantity.toString()}, \'${service}\', \'\', \'\', CURRENT_TIMESTAMP);`
  let res = await sqlRequest(sql);
  if(res.affectedRows == 1)return true;
  return false; 
}

async function checkUserExistence(telegram_id) {
  let sql = `SELECT * FROM \`nakruti\` WHERE \`telegram_id\` = ${telegram_id.toString()}`;
  let res = await sqlRequest(sql);
  if (res[0] === undefined) return false;
  return true;
}

module.exports = {
  startDataBase,
  getUserOrders,
  getUserBalance,
  addUserToDB,
  changeBalance,
  addOrder,
  checkUserExistence,
};
