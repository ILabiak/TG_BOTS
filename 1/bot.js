const { Telegraf } = require('telegraf')
const Extra = require('telegraf/extra')
const Markup = require('telegraf/markup')
const fetch = require('node-fetch');
const { Crypto } = require('./crypto.js');

const bot = new Telegraf('1803553886:AAF3IXViYwv2jLeG5D5HpbycovJh4twHtkE')
    bot.start((ctx) => ctx.reply('Welcome!'))
    //bot.help((ctx) => ctx.reply('Send me a sticker'))
    //bot.on('sticker', (ctx) => ctx.reply('👍'))
    //bot.hears('hi', (ctx) => ctx.reply('Hey there'))
bot.launch()
const crypto = new Crypto();

bot.command('cryptoprices', async (ctx) => ctx.reply(await crypto.cryptoPrices('btc','eth','ltc')))


