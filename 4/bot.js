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
reply( 'Введите сумму пополнения(не менее 0 рублей):' , Markup
  .keyboard(['Меню']).oneTime().resize().extra()
))
paymentAmountScene.hears('Меню', leave('greeter'))
paymentAmountScene.on('message', (ctx) => {
//console.dir(ctx.session.__scenes.state.amount)
if(parseInt(ctx.message.text)>=0){
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
  let paymentAmount = ctx.session.__scenes.state.amount;
  ctx.scene.enter('qiwiPayment', {amount : paymentAmount})
  })
paymentMethodScene.hears('...', leave('greeter'))
paymentMethodScene.on('message', (ctx) => ctx.reply('Message'))



const qiwiPaymentScene = new Scene('qiwiPayment')
qiwiPaymentScene.enter(async (ctx) =>{
  await ctx.reply('Перейдите по ссылке, оплатите, и нажмите кнопку \"Проверить оплату\"')
  ctx.reply(`https://qiwi.com/payment/form/99?amountInteger=${ctx.session.__scenes.state.amount}&amountFraction=0&currency=643&extra%5B%27comment%27%5D=${ctx.session.__scenes.expires}&extra%5B%27account%27%5D=${config.qiwi_number}&blocked%5B0%5D=comment&blocked%5B1%5D=account&blocked%5B2%5D=sum`,
  Markup.keyboard(['Проверить оплату', 'Меню']).oneTime().resize().extra())
})
qiwiPaymentScene.hears('Меню', leave('greeter'))
qiwiPaymentScene.hears('Проверить оплату', async (ctx) => {
  let paymentText = ctx.session.__scenes.expires.toString()
  let paymentAmount = ctx.session.__scenes.state.amount
  console.dir({paymentText,paymentAmount})
 let paymentRes = await receivePayment(paymentText,paymentAmount)
  if(paymentRes == 1){
  await  ctx.reply('Ваш баланс успешно пополнен')
  }else{
   await ctx.reply('Платеж не получен')
  }
 // console.dir(ctx.session.__scenes.expires)
  
  })
qiwiPaymentScene.hears('...', leave('greeter'))
qiwiPaymentScene.on('message', (ctx) => {
console.dir(ctx.session.__scenes.state.amount)
if(parseInt(ctx.message.text)>=50){
  
}
else{
  ctx.scene.enter('greeter')
}
})


const stage = new Stage([paymentAmountScene, paymentMethodScene,qiwiPaymentScene], { ttl: 500 })
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
  let txsList = await qiwi.transactionsList();
  let txArr = txsList.data
   for(let el of txArr){
      if(el.sum.amount == sum && el.comment.includes(paymentComment)){
          return 1;
      }
  }
  return 0; 
  }
