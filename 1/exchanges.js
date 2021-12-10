"use strict";

const { Telegraf } = require("telegraf");
const { Context } = require("telegraf");
const promised = require("./promised.js");
const { Wallet } = require("./wallet.js");

const green = "\x1b[32m";
const red = "\x1b[31m";

const errorHandlerWrapped = promised.errorWrapper(promised.handler);

const safeGet = errorHandlerWrapped(promised.getRequest);
const safePost = errorHandlerWrapped(promised.postRequest);
const safeSpawn = errorHandlerWrapped(promised.promiseSpawn);
const safeWrite = errorHandlerWrapped(promised.writeFile);

const genWalletFeature = async (crypto) => {
  /* console.log(
    '\x1b[32m',
    `Choose which wallet do you want to make:
    1 - Bitcoin;
    2 - Ethereum;
    3 - Dogecoin;
    Type anything to exit.`
  ); */
  let resultText = [];
  //const selection = parseInt(await promised.question('Select action\n')) - 1;
  //const currencies = ['btc', 'eth', 'doge'];
  //const resWall = currencies[selection];
  const wallet = new Wallet(crypto, "d190d4bbbc9e47a1962739eeb93f1819");
  await wallet.createWallet();
  resultText.push(`Wallet was successfully created! Your wallet data:
    ${wallet.keys}
     Please don't send anyone your private key or wif
     or you'll loose your money.
     We don't save any information about created wallets
     Make sure you saved all the information.
     `);
  return resultText.join("\n");
};

const btcAdrBalance = async (adrs) => {
  const wallet = new Wallet();
  if (adrs === undefined && adrs.length != 34) {
    ctx.reply("Wrong address\n");
  }
  const res = await wallet.getAdrsBalance(adrs);
  return res;
};

const feesRate = async () => {
  const cryptos = ["bitcoin", "bitcoin-cash", "dogecoin", "dash", "litecoin"];
  const res = [];
  res.push("These are fee rates for some cryptocurrencies:");
  const options = {
    method: "GET",
    hostname: "rest.cryptoapis.io",
    path: "",
    qs: [],
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": "43a92a397d069a08d7699bf43463076a5209771d",
    },
  };
  for (const crypto of cryptos) {
    const path = `/v2/blockchain-data/${crypto}/testnet/mempool/fees`;
    options.path = path;
    res.push(crypto.toUpperCase());
    const result = await safePost(options, "");
    const keys = Object.keys(result.data.item);
    keys.shift();
    for (const key of keys) {
      res.push(`${key}: ${result.data.item[key]}`);
    }
    res.push("\n");
  }
  console.log(res.join("\n"));
  return res;
};

module.exports = {
  genWalletFeature,
  btcAdrBalance,
  feesRate,
};
