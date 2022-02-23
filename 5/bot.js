"use strict";

const config = require("./config/config.json");
const Telegraf = require("telegraf");
const session = require("telegraf/session");
const Stage = require("telegraf/stage");
const Scene = require("telegraf/scenes/base");
const Extra = require("telegraf/extra");
const Markup = require("telegraf/markup");

const bot = new Telegraf(config.bot_token);

bot.use(session());
/* bot.catch((err) => {
  console.log(err)
}) */

bot.hears("AA", (ctx) => ctx.reply("TEST"));

bot.command("start", async (ctx) => {
  const text = ctx.update.message.text;
  if (text.includes("/start ")) {
    const startId = parseInt(text.replace("/start ", 0));
    bot.telegram.sendMessage(startId, "test").catch((e) => {
      ctx.reply(
        "Користувач, якому ви хочете написати, вже не користується цим ботом."
      );
    });
  } else {
    const userId = ctx.update.message.from.id;
    ctx.reply(`
Привіт, це бот для анонімного обміну повідомленнями.

Щоб отримати повідомлення від когось, розмісти це посилання в своїх соц. мережах:
https://t.me/anonymus3000bot?start=${userId}

`);
  }
});

bot.launch();

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
