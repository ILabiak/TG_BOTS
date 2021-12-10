"use strict";

const config = require('./config/config.json');
const Telegraf = require('telegraf')
const session = require('telegraf/session')
const Stage = require('telegraf/stage')
const Scene = require('telegraf/scenes/base')
const Extra = require('telegraf/extra')
const Markup = require('telegraf/markup')
const { enter, leave } = Stage
 
const api = require('./api');
const db = require('./db')
const scenes = require('./scenes');
const bot = new Telegraf(config.bot_token);

const stage = new Stage([
  scenes.paymentAmountScene,
  scenes.paymentMethodScene,
  scenes.qiwiPaymentScene,
  scenes.categoryScene,
  scenes.servicesScene,
  scenes.makeOrderScene
], { ttl: 1800 })
bot.use(session())
bot.use(stage.middleware())
//bot.hears('Заказать накрутку', (ctx) => ctx.scene.enter('newOrder'))
bot.hears('Пополнить💲', (ctx) => ctx.scene.enter('paymentAmount', {amount : 100}))
bot.hears('Услуги', (ctx) => ctx.scene.enter('category'))
bot.hears('Моя информация', async (ctx) => {
  const tgId = ctx.update.message.from.id
  const tgUsername = ctx.update.message.from.username
  const balance = await db.getUserBalance(tgId)
  ctx.reply(
`Имя пользователя: @${tgUsername}
Баланс: ${balance} руб.
`)
})

/*
TO DO
1.scene to make an order
2. feature to check orders
3. feature to check order status
4. Admin features:
 4.1 Add (or remove) balance to user directly from telegram
 4.2 Send message to admin when new payment is received
 */

bot.hears('id', (ctx) =>{
  console.dir(ctx.update.message.from)
})
bot.command('start', async (ctx) =>{

  const tgId = ctx.update.message.from.id
  const tgUsername = ctx.update.message.from.username
  //ctx.reply(`Привет, @${tgUsername}`)
  const exists = await (db.checkUserExistence(tgId))
  if(!exists) {
    await db.addUserToDB(tgId,tgUsername)
  ctx.reply(`Здраствуйте, это бот накрутки`, Markup
  .keyboard(['Моя информация', 'Заказать накрутку', 'Мои заказы', 'Пополнить💲', 'Услуги'])
  .resize()
  .extra())
  return;
  }
  ctx.reply('С возвращением', Markup
  .keyboard(['Моя информация', 'Заказать накрутку', 'Мои заказы', 'Пополнить💲', 'Услуги'])
  .resize()
  .extra()
)
return;
}
);

const start = async() =>{
  await db.startDataBase();
  await bot.launch();
  await scenes.startQiwi();
}

(async()=>{

await start();

})()




