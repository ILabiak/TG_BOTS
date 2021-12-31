"use strict";
const config = require("./config/config.json");
const axios = require("axios");

module.exports = {
  addPayment,
  getServices,
  makeOrder,
  getOrderDetails,
  getCategories,
  getCategoryServices,
  getServiceDetails,
};

async function addPayment(username, amount) {
  const res = await axios
    .post(`${config.smm_website}/adminapi/v1`, {
      key: config.website_admin_token,
      action: "addPayment",
      username: username,
      amount: amount.toString(),
    })
    .then((response) => {
      return response.data;
    });
  if (res.status == "success") {
    return 1;
  } else {
    return 0;
  }
}

async function getServices() {
  const res = await axios
    .get(
      `${config.smm_website}/api/v2/?key=${config.website_token}&action=services`
    )
    .then((response) => {
      return response.data;
    });
  return res;
}

async function makeOrder(serviceId, quantity, link) {
  const res = await axios
    .get(
      `${config.smm_website}/api/v2/?key=${config.website_token}&action=add&service=${serviceId}&quantity=${quantity}&link=${link}`
    )
    .then((response) => {
      return response.data;
    });
  if (res.order) return res.order;
  return false;
}

async function getOrderDetails(orderId) {
  const res = await axios
    .get(
      `${config.smm_website}/api/v2/?key=${config.website_token}&action=status&order=${orderId}`
    )
    //{"charge":"0.00","start_count":null,"status":"Completed","remains":"0","currency":"RUB"}
    .then((response) => {
      return response.data;
    });
  if (res.start_count == null) res.start_count = 0;
  let translate = {
    Pending: "В ожидании",
    Completed: "Завершено",
    Partial: "Выполнено частично",
    Canceled: "Отменено",
    Processing: "В обработке",
    "In progress": "В ходе выполнения",
    Fail: "Возникла ошибка",
  };
  let resultText = `Цена: ${res.charge} руб.
Статус: ${translate[res.status]}
Изначально: ${res.start_count}
Остается: ${res.remains}\n`;
const resObj = {
  charge : parseFloat(res.charge),
  start_count : parseInt(res.start_count),
  status : res.status,
  remains : res.remains,
  text : resultText,
}
  return resObj;
}

function getCategories(arr) {
  let categories = [];
  for (let obj of arr) {
    if (!categories.includes(obj.category)) {
      categories.push(obj.category);
    }
  }
  return categories;
}

function getCategoryServices(arr, category) {
  let services = [];
  for (let obj of arr) {
    if (obj.category.includes(category)) {
      services.push(`${obj.name} - ${obj.rate} руб.`);
    }
  }
  return services;
}

async function getServiceDetails(arr, serviceId) {
  let text;
  let min, max, price;
  for (let obj of arr) {
    let str = obj.name;
    let index = str.indexOf(":");
    let id = str.slice(2, index);
    if (id == serviceId) {
      min = obj.min;
      max = obj.max;
      price = obj.rate;
      text = `
Цена: ${obj.rate} руб.
Минимальный заказ: ${obj.min}
Максимальный заказ: ${obj.max}
`;
    }
  }
  return { text, min, max, serviceId, price };
}
(async () => {
  // console.log(await getServices())
})();
