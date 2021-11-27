"use strict";

const config = require('./config/config.json');
const Telegraf = require('telegraf')
const session = require('telegraf/session')
const Stage = require('telegraf/stage')
const Scene = require('telegraf/scenes/base')
const Extra = require('telegraf/extra')
const Markup = require('telegraf/markup')
const { enter, leave } = Stage
const fetch = require("node-fetch");
const fs = require("fs");
const https = require('https');


const bot = new Telegraf(config.bot_token);

//const stage = new Stage([scenes.paymentAmountScene, scenes.paymentMethodScene,scenes.qiwiPaymentScene, scenes.categoryScene, scenes.servicesScene], { ttl: 1800 })
bot.use(session());
bot.launch();
//bot.use(stage.middleware())
//bot.hears('Пополнить💲', (ctx) => ctx.scene.enter('paymentAmount', {amount : 100}))
bot.on("document", async (ctx) => {
    const documentName = ctx.update.message.document.file_name
    if(documentName.includes('.zip') || documentName.includes('.rar')){
        let messageId = ctx.update.message.message_id;
        let fileId = ctx.update.message.document.file_id;
        let link = await ctx.telegram.getFileLink(fileId);
        const filename = await downloadFile(link, `./3/download/`,documentName);

    }else{
        ctx.reply('неудача')
    }
  });
  

bot.hears('id', (ctx) =>{
  console.dir(ctx.update.message.from)
})
bot.command('start', async (ctx) =>ctx.reply('Привет'));

const downloadFile = async (url, path = "./3/download/",filename) => {
    const dirnames = fs.readdirSync('./3/download')
    while(dirnames.includes(filename)){
        filename = '(1)'+ filename
    }
    const fileStream = fs.createWriteStream(path + filename);
    https.get(url, function(response) {
  response.pipe(fileStream);
});
return path + filename;
  };







