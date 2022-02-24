"use strict";

const config = require("./config/config.json");
const Telegraf = require("telegraf");
const session = require("telegraf/session");
const Stage = require("telegraf/stage");
const Scene = require("telegraf/scenes/base");
const Extra = require("telegraf/extra");
const Markup = require("telegraf/markup");

const bot = new Telegraf(config.bot_token);

/* bot.catch((err) => {
  console.log(err)
}) */

const sendMessageScene = new Scene("sendMessage");
sendMessageScene.enter((ctx) => {
  ctx.reply(`Відправте анонімне повідомлення користувачу, який опублікував це посилання.

Напиши сюди в одному повідомленні все, що ти хочеш сказати отримувачу і через декілька секунд він отримає його.`);
});
sendMessageScene.on("message", async (ctx) => {
  const senderId = ctx.session.__scenes.state.senderId;
  const tgId = ctx.session.__scenes.state.tgId;
  if (tgId) {
    await bot.telegram
      .sendMessage(tgId, "Вам прийшло нове анонімне повідомлення:")
      .catch((e) => {});
    await bot.telegram
      .sendMessage(tgId, ctx.update.message.text, {
        reply_markup: {
          inline_keyboard: [[{ text: "Відповісти", callback_data: `reply_${senderId}` }]],
        },
      })
      .catch((e) => {
        ctx.reply(
          "Користувач, якому ви хочете написати, вже не користується цим ботом."
        );
      });
    ctx.scene.leave("sendMessage");
  }
});

const stage = new Stage([sendMessageScene]);

bot.use(session());
bot.use(stage.middleware());

bot.launch();

bot.command("start", async (ctx) => {
  const text = ctx.update.message.text;
  if (text.includes("/start ")) {
    const senderId = ctx.update.message.from.id;
    const startId = parseInt(text.replace("/start ", ""));
    ctx.scene.enter("sendMessage", { tgId: startId, senderId: senderId });
  } else {
    const userId = ctx.update.message.from.id;
    ctx.reply(`
  Привіт, це бот для анонімного обміну повідомленнями.
  
  Щоб отримати повідомлення від когось, розмісти це посилання в своїх соц. мережах:
  https://t.me/anonymus3000bot?start=${userId}
  `);
  }
});

bot.action(/reply_[0-9]*/, (ctx) => {
    const senderId = ctx.update.callback_query.from.id;
    const startId = parseInt(ctx.update.callback_query.data.replace('reply_', ''))
    ctx.scene.enter("sendMessage", { tgId: startId, senderId: senderId });
});

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
