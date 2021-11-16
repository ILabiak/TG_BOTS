"use strict";

const config = require('./config/config.json');
const Telegraf = require('telegraf')
const session = require('telegraf/session')
const Stage = require('telegraf/stage')
const Scene = require('telegraf/scenes/base')
const Extra = require('telegraf/extra')
const Markup = require('telegraf/markup')
const { enter, leave } = Stage

const QiwiApi = require('./qiwi')
const api = require('./api');
const db = require('./db')


const scenes = require('./scenes');
const { createGunzip } = require('zlib');
const bot = new Telegraf(config.bot_token);

const qiwi = new QiwiApi({
  accessToken: config.qiwi_token, // Токен кошелька https://qiwi.com/api
  personId: config.qiwi_number // Номер кошелька
});


const stage = new Stage([scenes.paymentAmountScene, scenes.paymentMethodScene,scenes.qiwiPaymentScene, scenes.categoryScene, scenes.servicesScene], { ttl: 1800 })
bot.use(session())
bot.use(stage.middleware())
bot.hears('Пополнить💲', (ctx) => ctx.scene.enter('paymentAmount', {amount : 100}))
bot.hears('Услуги', (ctx) => ctx.scene.enter('category'))
bot.command('test', ({ reply }) =>
  reply('Выберите действие', Markup
    .keyboard(['Пополнить💲', 'Услуги'])
    .oneTime()
    .resize()
    .extra()
  )
)
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
  ctx.reply(`Здраствуйте, это бот накрутки`)
  ctx.reply( `${tgId} - ${tgUsername}`)
                                        // Доробити перехід в сцену головного меню
  return;
  }
  ctx.reply('С возвращением')
                                      // Доробити перехід в сцену головного меню
return;
}

);

const start = async() =>{
  const dbstatus = await db.startDataBase();
  await bot.launch();
  }


(async()=>{

await start();

  })()



const receivePayment = async(paymentComment, sum) =>{
  let txsList = await qiwi.transactionsList();
  let txArr = txsList.data
   for(let el of txArr){
      if(el.sum.amount == sum && el.comment.includes(paymentComment)){
          return 1;
      }
  }
  return 0; 
  }
