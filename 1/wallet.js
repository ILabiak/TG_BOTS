"use strict";

const promised = require("./promised.js");
const { Crypto } = require("./crypto.js");
const crypto = new Crypto();

const errorHandlerWrapped = promised.errorWrapper(promised.handler);

const safeGet = errorHandlerWrapped(promised.getRequest);

const safePost = errorHandlerWrapped(promised.postRequest);

class Wallet {
  _token;
  _keys;

  constructor(currency, token) {
    this.defaultUrl = "api.blockcypher.com";
    this.defaultPath = `/v1/${currency}/main/`;
    this._token = token;
  }

  async createWallet() {
    const path = this.defaultPath + `addrs?token=`;
    const data = JSON.stringify({
      token: this._token,
    });
    const options = {
      method: "POST",
      hostname: this.defaultUrl,
      path,
      headers: {},
    };
    const result = await safePost(options, data);
    this._keys = result;
    return result;
  }
  async getAdrsBalance(adrs) {
    const path = `/v1/btc/main/addrs/${adrs}/balance`;
    const link = "https://" + this.defaultUrl + path;
    const result = [];
    const getInfo = await safeGet(link);
    const received = await crypto.currencyexchanger(
      getInfo.total_received / 100000000,
      "btc",
      "usd"
    );
    const sent = await crypto.currencyexchanger(
      getInfo.total_sent / 100000000,
      "btc",
      "usd"
    );
    const balance = await crypto.currencyexchanger(
      getInfo.balance / 100000000,
      "btc",
      "usd"
    );
    result.push(`Total received: ${received[0]} USD`);
    result.push(`Total send: ${sent[0]} USD`);
    result.push(`Balance: ${balance[0]} USD`);
    result.push(`Details: https://www.blockchain.com/btc/address/${adrs}`);
    //console.log(`${result.join('\n')}\n`);
    return result.join("\n");
  }
  get keys() {
    if (!this._keys) return null;
    const walletInfo = [];
    const keys = Object.keys(this._keys);
    for (const key of keys) {
      walletInfo.push(`${key}:${this._keys[key]}\n`);
    }
    return walletInfo;
  }
}

module.exports = {
  Wallet,
};
