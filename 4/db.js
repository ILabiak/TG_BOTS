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
  await startDataBase();
  //console.dir(await getUserOrders(868619239))
  //console.dir(await getUserBalance(868619239))
  //console.dir(await addUserToDB(234234234, 'Testin.'))
  //console.dir(await changeBalance(234234234, 5))
  //console.dir(await addOrder(3555,234234234, 53.5,'insfsst.com',172,"Подписчики"))
  //console.dir(await checkUserExistence(868619239))
  //console.dir(await getOrderDetails(3555))
  //console.dir(await updateOrderDetails(3555, 10.5, 11, 'Completed', 22))
})();

async function sqlRequest(sql, params = null) {
  return new Promise(function (resolve, reject) {
    con.query(sql, params, function (err, rows) {
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
  //+
  let sql = `SELECT * FROM \`orders\` WHERE \`user\` = ?`;
  let res = await sqlRequest(sql, [telegram_id.toString()]);
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
]
*/

async function getUserBalance(telegram_id) {
  //+
  let sql = `SELECT balance FROM \`nakruti\` WHERE \`telegram_id\` = ?`;
  let res = await sqlRequest(sql, [telegram_id.toString()]);
  return eval(res[0].balance);
}

async function addUserToDB(telegram_id, username) {
  let checkidtext = `SELECT * FROM \`nakruti\` WHERE \`telegram_id\` = ?`;
  let checkid = await sqlRequest(checkidtext, [telegram_id.toString()]);
  if (!checkid[0]) {
    console.log(telegram_id.toString());
    let sql = `INSERT INTO \`nakruti\` (\`id\`, \`telegram_id\`, \`username\`, \`api_token\`, \`balance\`) VALUES (NULL, '?', ?, \'\', \'\');`;
    let res = await sqlRequest(sql, [telegram_id, `${username}`]);
    if (res.affectedRows == 1) return true;
  }
  return false;
}

async function changeBalance(telegram_id, amount) {
  const balanceStr = await getUserBalance(telegram_id);
  let balance = parseFloat(balanceStr);
  balance += parseFloat(amount);
  let sql = `UPDATE \`nakruti\` SET \`balance\` = ? WHERE \`nakruti\`.\`telegram_id\` = ?;`;
  let res = await sqlRequest(sql, [
    `${balance.toString()}'`,
    telegram_id.toString(),
  ]);
  if (res.changedRows == 1) return true;
  return false;
}

async function addOrder(orderId, telegram_id, charge, link, quantity, service) {
  let sql = `INSERT INTO \`orders\` (\`id\`, \`orderId\`, \`user\`, \`charge\`, \`link\`, \`start_count\`, \`quantity\`, \`service\`, \`status\`, \`remains\`, \`created\`) 
  VALUES (NULL, ?, ?, ?, ?, \'\', ?, ?, \'\', \'\', CURRENT_TIMESTAMP);`;
  let res = await sqlRequest(sql, [
    orderId.toString(),
    telegram_id.toString(),
    charge.toString(),
    `${link.toString()}`,
    quantity.toString(),
    `${service}`,
  ]);
  if (res.affectedRows == 1) return true;
  return false;
}

async function checkUserExistence(telegram_id) {
  let sql = `SELECT * FROM \`nakruti\` WHERE \`telegram_id\` = ?`;
  let res = await sqlRequest(sql, [telegram_id.toString()]);
  if (res[0] === undefined) return false;
  return true;
}

async function getOrderDetails(orderId) {
  let sql = `SELECT * FROM \`orders\` WHERE \`orderId\` = ?`;
  let res = await sqlRequest(sql, [orderId.toString()]);
  if (res[0] === undefined) return false;
  return res[0];
}

async function updateOrderDetails(
  orderId,
  charge,
  start_count,
  status,
  remains
) {
  let sql = `UPDATE \`orders\` SET \`charge\` = ?, \`start_count\` = ?, \`status\` = ?, \`remains\` = ? WHERE \`orders\`.\`orderId\` = ?;`;
  let res = await sqlRequest(sql, [
    charge,
    start_count,
    status,
    remains,
    orderId,
  ]);
  if (res.changedRows == 1) return true;
  return false;
}

module.exports = {
  startDataBase,
  getUserOrders,
  getUserBalance,
  addUserToDB,
  changeBalance,
  addOrder,
  checkUserExistence,
  getOrderDetails,
  updateOrderDetails,
};
