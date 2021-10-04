const { Telegraf } = require('telegraf')
const session = require('telegraf/session')
const Extra = require('telegraf/extra')
const Markup = require('telegraf/markup')
const fetch = require('node-fetch');
const { Crypto } = require('./crypto.js');
const exchanges = require('./exchanges.js');

const bot = new Telegraf('')
    bot.start((ctx) => ctx.reply('Welcome!'))
    //bot.help((ctx) => ctx.reply('Send me a sticker'))
    //bot.on('sticker', (ctx) => ctx.reply('👍'))
    //bot.hears('hi', (ctx) => ctx.reply('Hey there'))
bot.launch()
bot.use(session())
const crypto = new Crypto();

bot.command('cryptoprices', async (ctx) => {
    let currency = ctx.update.message.text.split(' ')[1];
    if(currency === undefined || currency.toLowerCase() =='usd'){
        ctx.reply(await crypto.cryptoPrices('btc','eth','ltc'));
        return;
    }
    ctx.reply(await crypto.cryptoPrices(currency));
});

bot.command('generatebtcaddress', async (ctx) => ctx.reply(await exchanges.genWalletFeature('btc')));
bot.command('generateethaddress', async (ctx) => ctx.reply(await exchanges.genWalletFeature('eth')));
bot.command('generatedogeaddress', async (ctx) => ctx.reply(await exchanges.genWalletFeature('doge')));

bot.hears('Bitcoin price', async (ctx) => ctx.reply(await crypto.cryptoPrices('btc')));
bot.hears('Ethereum price', async (ctx) => ctx.reply(await crypto.cryptoPrices('eth')));
bot.hears('Litecoin price', async (ctx) => ctx.reply(await crypto.cryptoPrices('ltc')));

bot.command('addressinfo',async  (ctx)=> {
    let adr = ctx.update.message.text.split(' ')[1];
    if(adr === undefined || adr.length != 34 ){
        ctx.reply('Wrong address');
        return;
    }
    ctx.reply(await exchanges.btcAdrBalance(adr));
});

