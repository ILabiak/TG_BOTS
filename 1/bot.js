const { Telegraf } = require('telegraf')
const Extra = require('telegraf/extra')
const Markup = require('telegraf/markup')
const fetch = require('node-fetch');
const { Crypto } = require('./crypto.js');
const exchanges = require('./exchanges.js');

const bot = new Telegraf('token')
    bot.start((ctx) => ctx.reply('Welcome!'))
    //bot.help((ctx) => ctx.reply('Send me a sticker'))
    //bot.on('sticker', (ctx) => ctx.reply('👍'))
    //bot.hears('hi', (ctx) => ctx.reply('Hey there'))
bot.launch()
const crypto = new Crypto();

bot.command('cryptoprices', async (ctx) => ctx.reply(await crypto.cryptoPrices('btc','eth','ltc')));

bot.command('generatebtcaddress', async (ctx) => ctx.reply(await exchanges.genWalletFeature('btc')));
bot.command('generateethaddress', async (ctx) => ctx.reply(await exchanges.genWalletFeature('eth')));
bot.command('generatedogeaddress', async (ctx) => ctx.reply(await exchanges.genWalletFeature('doge')));

bot.hears('Bitcoin price', async (ctx) => ctx.reply(await crypto.cryptoPrices('btc')));
