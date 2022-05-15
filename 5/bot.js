"use strict";

const config = require("./config/config.json");
const Telegraf = require("telegraf");
const session = require("telegraf/session");


const https = require("https");
const archiver = require("archiver");

const bot = new Telegraf(config.bot_token);

bot.use(session());
bot.launch();
bot.catch((err) => {
  bot.telegram.sendMessage("868619239", err.toString());
})


bot.hears("test", (ctx) => {
  ctx.reply("Bot works");
});

bot.command("start", async (ctx) => ctx.reply("Привіт, це бот для пошуку палива на АЗК ОККО"));


