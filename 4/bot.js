"use strict";

//const config = require('config');
const config = require('./config/config.json');

const { Telegraf, Extra } = require("telegraf");
const { bot_token } = require('./config/default');
const QiwiApi = require('./qiwi')
const bot = new Telegraf(config.bot_token);

const qiwi = new QiwiApi({
  accessToken: config.qiwi_token, // Токен кошелька https://qiwi.com/api
  personId: config.qiwi_number // Номер кошелька
});

bot.start((ctx) => ctx.reply("Привет, это бот nakru-ti!!!"));
bot.use();
bot.launch();


bot.on('sticker', async (ctx) =>{
  //console.log(ctx.update.message.message_id);
  let messageId = ctx.update.message.message_id;
  ctx.reply('response', Extra.inReplyTo(messageId))
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