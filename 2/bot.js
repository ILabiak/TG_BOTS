const { Telegraf } = require('telegraf')
const Extra = require('telegraf/extra')
const Markup = require('telegraf/markup')
const fetch = require('node-fetch');

const bot = new Telegraf('1928863484:AAGls_cY8lSsbrPuPc41VowdBAE_S89WFsA')
    bot.start((ctx) => ctx.reply('Welcome!'))
    bot.help((ctx) => ctx.reply('Send me a sticker'))
    bot.on('sticker', (ctx) => ctx.reply('👍'))
    bot.hears('hi', (ctx) => ctx.reply('Hey there'))
bot.launch()


bot.command('cryptoprices', async (ctx) => {
    let currency = ctx.update.message.text.split(' ')[1];
    if(currency === undefined || currency.toLowerCase() =='usd'){
        ctx.reply(await crypto.cryptoPrices('btc','eth','ltc'));
        return;
    }
    ctx.reply(await crypto.cryptoPrices(currency));
});

