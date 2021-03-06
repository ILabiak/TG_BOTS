const Stage = require("telegraf/stage");
const Scene = require("telegraf/scenes/base");
const Extra = require("telegraf/extra");
const Markup = require("telegraf/markup");
const { enter, leave } = Stage;
const QiwiApi = require("./qiwi");
const api = require("./api");
const db = require("./db");
const config = require("./config/config.json");

let qiwi;

const startQiwi = async () => {
  qiwi = new QiwiApi({
    accessToken: config.qiwi_token, // Токен кошелька https://qiwi.com/api
    personId: config.qiwi_number, // Номер кошелька
  });
  return 1;
};

const showMenu = (context) => {
  context.reply(
    "Вы были перемещены в меню:",
    Markup.keyboard([
      "Моя информация",
      "Заказать накрутку",
      "Мои заказы",
      "Пополнить💲",
      "Поддержка",
    ])
      .resize()
      .extra()
  );
};

const paymentAmountScene = new Scene("paymentAmount");
paymentAmountScene.enter(async (ctx) => {
  const tgId = ctx.update.message.from.id;
  const balance = await db.getUserBalance(tgId);
  await ctx.reply(`Ваш текущий баланс: ${balance}`);
  ctx.reply(
    "Введите сумму пополнения(не менее 0 рублей):",
    Markup.keyboard(["Меню"]).oneTime().resize().extra()
  );
});
paymentAmountScene.hears("Меню", (ctx) => {
  showMenu(ctx);
  ctx.scene.leave("paymentAmount");
});
paymentAmountScene.on("message", (ctx) => {
  if (parseInt(ctx.message.text) >= 0) {
    let paymentAmount = parseInt(ctx.message.text);
    ctx.scene.enter("paymentMethod", { amount: paymentAmount });
  } else {
    ctx.scene.enter("paymentAmount");
  }
});

const paymentMethodScene = new Scene("paymentMethod");
paymentMethodScene.enter(({ reply }) =>
  reply(
    "Выберите способ оплаты:",
    Markup.keyboard([["Qiwi", "Меню"]])
      .oneTime()
      .resize()
      .extra()
  )
);
paymentMethodScene.hears("Меню", (ctx) => {
  showMenu(ctx);
  ctx.scene.leave("paymentMethod");
});
paymentMethodScene.hears("Qiwi", (ctx) => {
  let paymentAmount = ctx.session.__scenes.state.amount;
  ctx.scene.enter("qiwiPayment", { amount: paymentAmount });
});

const qiwiPaymentScene = new Scene("qiwiPayment");
qiwiPaymentScene.enter(async (ctx) => {
  ctx.session.__scenes.state.tgId = ctx.update.message.from.id;
  const paymentLink = `https://qiwi.com/payment/form/99?amountInteger=${ctx.session.__scenes.state.amount}&amountFraction=0&currency=643&extra%5B%27comment%27%5D=${ctx.session.__scenes.expires}&extra%5B%27account%27%5D=${config.qiwi_number}&blocked%5B0%5D=comment&blocked%5B1%5D=account&blocked%5B2%5D=sum`;
  ctx.telegram.sendMessage(
    ctx.chat.id,
    `Перейдите по ссылке, оплатите, и нажмите кнопку "Проверить"`,
    {
      reply_markup: {
        inline_keyboard: [
          [
            { text: "Перейти", url: paymentLink },
            { text: "Проверить", callback_data: "check" },
          ],
          [{ text: "Меню", callback_data: "menu" }],
        ],
      },
    }
  );
});
qiwiPaymentScene.action("menu", leave("qiwiPayment"));
qiwiPaymentScene.action("check", async (ctx) => {
  let paymentText = ctx.session.__scenes.expires.toString();
  let paymentAmount = parseFloat(ctx.session.__scenes.state.amount);
  let paymentRes = await qiwi.receivePayment(paymentText, paymentAmount);
  if (paymentRes == 1) {
    const tgId = ctx.session.__scenes.state.tgId;
    await db.changeBalance(tgId, paymentAmount);
    ctx.reply("Ваш баланс успешно пополнен");
    ctx.telegram.sendMessage(
      config.admin_telegram_id,
      `Получено пополнение на сумму ${paymentAmount} руб.`
    );
    const balance = await db.getUserBalance(tgId);
    await ctx.reply(`Ваш баланс: ${balance}`);
    ctx.scene.leave("qiwiPayment");
  } else {
    await ctx.reply("Платеж не получен");
    return;
  }
});

const categoryScene = new Scene("category");
categoryScene.enter(async ({ reply }) => {
  const services = await api.getServices();
  const categories = await api.getCategories(services);
  reply(
    "Выберите категорию:",
    Markup.keyboard(categories).oneTime().resize().extra()
  );
});
categoryScene.hears("Меню", leave("category"));
categoryScene.on("message", async (ctx) => {
  const services = await api.getServices();
  const categories = await api.getCategories(services);
  if (categories.includes(ctx.update.message.text)) {
    ctx.scene.enter("services", { category: ctx.update.message.text });
  }
});

const servicesScene = new Scene("services");
servicesScene.enter(async (ctx) => {
  const category = ctx.session.__scenes.state.category;
  const servicesList = await api.getServices();
  const services = await api.getCategoryServices(servicesList, category);
  ctx.reply(
    "Выберите услугу:",
    Markup.keyboard(services).oneTime().resize().extra()
  );
});
servicesScene.hears("Меню", leave("services"));
servicesScene.on("message", async (ctx) => {
  if (ctx.update.message.text.includes("ID")) {
    const str = ctx.update.message.text;
    const index = str.indexOf(":");
    const serviceId = str.slice(2, index);
    const services = await api.getServices();
    const serviceDetails = await api.getServiceDetails(services, serviceId);
    const serviceDescription = await db.getServiceDescription(serviceId);
    await ctx.reply(serviceDetails.text + serviceDescription);
    ctx.scene.enter("makeOrder", {
      serviceName: str,
      serviceId: serviceId,
      category: ctx.session.__scenes.state.category,
      min: serviceDetails.min,
      max: serviceDetails.max,
      price: serviceDetails.price,
    });
  }
});

const makeOrderScene = new Scene("makeOrder");
makeOrderScene.enter(async (ctx) => {
  ctx.reply(
    `Выберите действие:`,
    Markup.keyboard([
      "Заказать",
      "Меню ",
      "Выбрать другую услугу",
      "Выбрать другую категорию",
    ])
      .resize()
      .extra()
  );
});
makeOrderScene.hears("Заказать", (ctx) =>
  ctx.scene.enter("orderLink", {
    serviceName: ctx.session.__scenes.state.serviceName,
    serviceId: ctx.session.__scenes.state.serviceId,
    min: ctx.session.__scenes.state.min,
    max: ctx.session.__scenes.state.max,
    price: ctx.session.__scenes.state.price,
  })
);
makeOrderScene.hears("Меню", (ctx) => {
  showMenu(ctx);
  ctx.scene.leave("makeOrder");
});
makeOrderScene.hears("Выбрать другую услугу", (ctx) =>
  ctx.scene.enter("services", { category: ctx.session.__scenes.state.category })
);
makeOrderScene.hears("Выбрать другую категорию", (ctx) =>
  ctx.scene.enter("category")
);
makeOrderScene.on("message", leave("makeOrder"));

const makeOrderLinkScene = new Scene("orderLink");
makeOrderLinkScene.enter((ctx) => {
  ctx.reply(
    "Укажите ссылку, куда будет происходить накрутка",
    Markup.keyboard(["Отменить"]).resize().extra()
  );
});
makeOrderLinkScene.hears("Отменить", (ctx) => {
  showMenu(ctx);
  ctx.scene.leave("orderLink");
});
makeOrderLinkScene.on("message", (ctx) => {
  let link;
  const message = ctx.update.message.text;
  const linkRegex = new RegExp(
    /^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/
  );
  if (linkRegex.test(message)) {
    link = message;
    ctx.scene.enter("orderAmount", {
      serviceName: ctx.session.__scenes.state.serviceName,
      serviceId: ctx.session.__scenes.state.serviceId,
      min: ctx.session.__scenes.state.min,
      max: ctx.session.__scenes.state.max,
      price: ctx.session.__scenes.state.price,
      link: link,
    });
  } else {
    ctx.reply(
      "Неправильная ссылка, попробуйте ввести снова, либо нажмите кнопку Отменить",
      Markup.keyboard(["Отменить"]).resize().extra()
    );
  }
});

const makeOrderAmountScene = new Scene("orderAmount");
makeOrderAmountScene.enter((ctx) => {
  const [min, max] = [
    ctx.session.__scenes.state.min,
    ctx.session.__scenes.state.max,
  ];
  ctx.reply(`Укажите количество, которое вы хотите накрутить
От ${min} до ${max}.`);
}, Markup.keyboard(["Отменить"]).resize().extra());
makeOrderAmountScene.hears("Отменить", (ctx) => {
  showMenu(ctx);
  ctx.scene.leave("orderAmount");
});
makeOrderAmountScene.on("message", (ctx) => {
  const amount = parseInt(ctx.message.text);
  if (
    amount >= ctx.session.__scenes.state.min &&
    amount <= ctx.session.__scenes.state.max
  ) {
    ctx.scene.enter("submitOrder", {
      serviceName: ctx.session.__scenes.state.serviceName,
      serviceId: ctx.session.__scenes.state.serviceId,
      min: ctx.session.__scenes.state.min,
      max: ctx.session.__scenes.state.max,
      price: ctx.session.__scenes.state.price,
      link: ctx.session.__scenes.state.link,
      amount: amount,
    });
  } else {
    ctx.reply(
      "Неправильное количество, попробуйте ввести снова, либо нажмите кнопку Отменить",
      Markup.keyboard(["Отменить"]).resize().extra()
    );
  }
});

const submitOrderScene = new Scene("submitOrder");
submitOrderScene.enter((ctx) => {
  const [serviceName, serviceId, link, amount, price] = [
    ctx.session.__scenes.state.serviceName,
    ctx.session.__scenes.state.serviceId,
    ctx.session.__scenes.state.link,
    ctx.session.__scenes.state.amount,
    ctx.session.__scenes.state.price,
  ];
  const totalcost = (amount * price) / 1000;
  ctx.reply(`Информация о заказе:
ID услуги: ${serviceId}
Услуга: ${serviceName}
Ссылка: ${link}
Количество: ${amount}
С Вашего баланса спишется ${totalcost} руб.`);
  ctx.reply(
    "Выберите действие:",
    Markup.keyboard(["Подтвердить заказ", "Отменить заказ", "Меню"])
      .resize()
      .extra()
  );
});
submitOrderScene.hears("Подтвердить заказ", async (ctx) => {
  let charge = 0;
  let takeMoney;
  const [telegramId, serviceName, serviceId, link, amount, price] = [
    ctx.update.message.from.id,
    ctx.session.__scenes.state.serviceName,
    ctx.session.__scenes.state.serviceId,
    ctx.session.__scenes.state.link,
    ctx.session.__scenes.state.amount,
    ctx.session.__scenes.state.price,
  ];
  totalcost = (amount * price) / 1000;
  const userBalance = db.getUserBalance(telegramId);
  if (userBalance < totalcost) {
    ctx.reply("Недостаточно средств на балансе.");
    showMenu(ctx);
    ctx.scene.leave("submitOrder");
  }
  if (totalcost > 0) {
    charge -= totalcost;
    takeMoney = await db.changeBalance(telegramId, charge);
  } else {
    takeMoney = true;
  }
  if (takeMoney) {
    const orderRes = await api.makeOrder(serviceId, amount, link);
    if (orderRes) {
      const dbRes = await db.addOrder(
        orderRes,
        telegramId,
        totalcost,
        link,
        amount,
        serviceName
      );
      if (dbRes == false) {
        ctx.telegram.sendMessage(config.admin_telegram_id, `Ошибка в БД`);
      }

      ctx.reply(`Ваш заказ успешно создан
ID заказа: ${orderRes}`);
      showMenu(ctx);
      ctx.scene.leave("submitOrder");
    } else {
      ctx.reply("Возникла ошибка при создании заказа");
      await db.changeBalance(telegramId, -charge);
      showMenu(ctx);
      ctx.scene.leave("submitOrder");
    }
  } else {
    ctx.reply("Возникла ошибка");
    showMenu(ctx);
    ctx.scene.leave("submitOrder");
  }
});
submitOrderScene.hears(["Отменить заказ", "Меню"], (ctx) => {
  showMenu(ctx);
  ctx.scene.leave("submitOrder");
});
submitOrderScene.on("message", leave("submitOrder"));

const userOrdersScene = new Scene("userOrders");
userOrdersScene.enter(async (ctx) => {
  let counter,
    telegramId,
    orderIds = [],
    keyboardIds = [],
    keyboardArr = [],
    ordersArr = [];
  const splitter = 3;
  if (!ctx.session.__scenes.state.telegramId) {
    telegramId = ctx.update.message.from.id;
    ctx.session.__scenes.state.telegramId = telegramId;
  } else {
    telegramId = ctx.session.__scenes.state.telegramId;
  }

  if (ctx.session.__scenes.state.counter) {
    counter = ctx.session.__scenes.state.counter;
  } else {
    counter = 0;
    ctx.session.__scenes.state.counter = counter;
  }
  if (!ctx.session.__scenes.state.arr) {
    let orders = await db.getUserOrders(telegramId);
    orders.reverse();
    for (let el of orders) {
      orderIds.push(el.orderId.toString());
      keyboardIds.push({
        text: el.orderId.toString(),
        callback_data: el.orderId.toString(),
      });
    }
    if (!orderIds[0]) {
      ctx.reply("У Вас нет заказов");
      showMenu(ctx);
      ctx.scene.leave("userOrders");
    }
    for (let i = 0; i < Math.ceil(keyboardIds.length / splitter); i++) {
      keyboardArr[i] = keyboardIds.slice(i * splitter, i * splitter + splitter);
    }

    ctx.session.__scenes.state.arr = JSON.parse(JSON.stringify(orderIds));
    ctx.session.__scenes.state.keyboardArr = JSON.parse(
      JSON.stringify(keyboardArr)
    );
  } else {
    ordersArr = JSON.parse(JSON.stringify(ctx.session.__scenes.state.arr));
    keyboardArr = JSON.parse(
      JSON.stringify(ctx.session.__scenes.state.keyboardArr)
    );
  }

  if (counter < 0) counter = 0;
  if (counter > keyboardArr.length - 1) counter = keyboardArr.length - 1;
  if (counter == 0)
    keyboardArr[counter].push({ text: ">>", callback_data: ">>" });
  else if (counter == keyboardArr.length - 1)
    keyboardArr[counter].push({ text: "<<", callback_data: "<<" });
  else if (counter > 0 && counter < keyboardArr.length - 1) {
    keyboardArr[counter].unshift({ text: "<<", callback_data: "<<" });
    keyboardArr[counter].push({ text: ">>", callback_data: ">>" });
  }
  ctx.telegram.sendMessage(ctx.chat.id, "Список ваших заказов:", {
    reply_markup: {
      inline_keyboard: [
        [...keyboardArr[counter]],
        [{ text: "Меню", callback_data: "menu" }],
      ],
    },
  });
});
userOrdersScene.action(">>", (ctx) => {
  ctx.deleteMessage();
  let counter = ctx.session.__scenes.state.counter;
  counter++;
  ctx.scene.enter("userOrders", {
    telegramId: ctx.session.__scenes.state.telegramId,
    counter: counter,
    arr: ctx.session.__scenes.state.arr,
    keyboardArr: ctx.session.__scenes.state.keyboardArr,
  });
});
userOrdersScene.action("<<", (ctx) => {
  ctx.deleteMessage();
  let counter = ctx.session.__scenes.state.counter;
  counter--;
  ctx.scene.enter("userOrders", {
    telegramId: ctx.session.__scenes.state.telegramId,
    counter: counter,
    arr: ctx.session.__scenes.state.arr,
    keyboardArr: ctx.session.__scenes.state.keyboardArr,
  });
});
userOrdersScene.action("menu", (ctx) => {
  ctx.deleteMessage();
  showMenu(ctx);
  ctx.scene.leave("userOrders");
});
userOrdersScene.action(/^\d+$/, async (ctx) => {
  const message = ctx.update.callback_query.data;
  const ordersArr = ctx.session.__scenes.state.arr;
  if (ordersArr.includes(message)) {
    const orderId = parseInt(message);
    const apiOrderDetails = await api.getOrderDetails(orderId);
    const dbOrderDetails = await db.getOrderDetails(orderId);
    if (apiOrderDetails.charge < dbOrderDetails.charge) {
      const chargeDiff = dbOrderDetails.charge - apiOrderDetails.charge;
      const telegramId = ctx.update.message.from.id;
      await db.changeBalance(telegramId, chargeDiff);
    }
    await db.updateOrderDetails(
      orderId,
      apiOrderDetails.charge,
      apiOrderDetails.start_count,
      apiOrderDetails.status,
      apiOrderDetails.remains
    );
    const orderInfo = apiOrderDetails.text + `Ссылка: ${dbOrderDetails.link}`;
    ctx.reply(orderInfo);
  } else {
    showMenu(ctx);
    ctx.scene.leave("userOrders");
  }
});
userOrdersScene.on("message", async (ctx) => {
  showMenu(ctx);
  ctx.scene.leave("userOrders");
});

module.exports = {
  paymentAmountScene,
  paymentMethodScene,
  qiwiPaymentScene,
  categoryScene,
  servicesScene,
  makeOrderScene,
  makeOrderLinkScene,
  makeOrderAmountScene,
  submitOrderScene,
  userOrdersScene,
  startQiwi,
  showMenu,
};
