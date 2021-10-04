"use strict";

const { Telegraf, Extra } = require("telegraf");
const fetch = require("node-fetch");

const bot = new Telegraf("token");
bot.start((ctx) => ctx.reply("Привет, это чекер куков Instagram!"));
bot.use();
bot.launch();
bot.on("document", async (ctx) => { });

const downloadFile = async (url, path = "./cookies/1.txt") => {
  const res = await fetch(url);
  const fileStream = fs.createWriteStream(path);
  await new Promise((resolve, reject) => {
    res.body.pipe(fileStream);
    res.body.on("error", reject);
    fileStream.on("finish", resolve);
  });
};

bot.on('sticker', async (ctx) =>{
  //console.log(ctx.update.message.message_id);
  let messageId = ctx.update.message.message_id;
  ctx.reply('response', Extra.inReplyTo(messageId))
})