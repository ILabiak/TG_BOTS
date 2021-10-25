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
const bot = new Telegraf(config.bot_token);

const qiwi = new QiwiApi({
  accessToken: config.qiwi_token, // Токен кошелька https://qiwi.com/api
  personId: config.qiwi_number // Номер кошелька
});

const paymentAmountScene = new Scene('paymentAmount')
paymentAmountScene.enter(({ reply }) =>
reply( 'Введите сумму пополнения(не менее 50 рублей):' , Markup
  .keyboard(['Меню']).oneTime().resize().extra()
))
paymentAmountScene.hears('Меню', leave('greeter'))
paymentAmountScene.on('message', (ctx) => {
//console.dir(ctx.session.__scenes.state.amount)
if(parseInt(ctx.message.text)>=50){
  let paymentAmount = ctx.message.text;
  ctx.scene.enter('paymentMethod', {amount : paymentAmount})
}
else{
  ctx.scene.enter('greeter')
}
})



const paymentMethodScene = new Scene('paymentMethod')
paymentMethodScene.enter(({ reply }) =>
reply( 'Выберите способ оплаты:' , Markup
  .keyboard(['Qiwi', '...', 'Меню']).oneTime().resize().extra()
))
paymentMethodScene.hears('Меню', leave('greeter'))
paymentMethodScene.hears('Qiwi', (ctx) => {
  
  ctx.reply(ctx.session.__scenes.state.amount)
  
  })
paymentMethodScene.hears('...', leave('greeter'))
paymentMethodScene.on('message', (ctx) => {
console.dir(ctx.session.__scenes.state.amount)
if(parseInt(ctx.message.text)>=50){
  
}
else{
  ctx.scene.enter('greeter')
}
})




const stage = new Stage([paymentAmountScene, paymentMethodScene], { ttl: 10 })
bot.use(session())
bot.use(stage.middleware())
bot.hears('Пополнить💲', (ctx) => ctx.scene.enter('paymentAmount', {amount : 100}))
bot.command('test', ({ reply }) =>
  reply('Выберите действие', Markup
    .keyboard(['Пополнить💲'])
    .oneTime()
    .resize()
    .extra()
  )
)
bot.launch();




bot.on('sticker', async (ctx) =>{
  //console.log(ctx.update.message.message_id);
  let messageId = ctx.update.message.message_id;
})

const receivePayment = async(paymentComment, sum) =>{
  txsList = await qiwi.transactionsList();
  txArr = txsList.data
  
   for(let el of txArr){
      if(el.sum.amount == sum && el.comment.includes(paymentComment)){
          console.dir(el)
      }
  } 
  }
  
  (async()=>{
  
     // await receivePayment('2809477',100)
  })()