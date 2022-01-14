"use strict";

const fs = require("fs");
const https = require("https");

const filePath = './3/download/1/Cookies.txt'

const checkForValid = async (cookies) => {
  if (typeof sessionIdCookie === "string") {
    let request = await fetch("https://www.instagram.com/", {
      headers: {
        Cookie: `sessionid=${sessionIdCookie}; Domain=.instagram.com; `,
      },
    })
      .then((request) => request.text())
      .then(async (body) => {
        let data = [];
        let arr = body.split("\n");
        for (let el of arr) {
          if (el.includes('viewer":{"biography')) {
            data.push(el);
          }
        }
        if (data[0]) {
          return "Валид\n";
        } else {
          return "Невалид\n";
        }
      });
    return request;
  } else {
    ctx.reply("wrong format\n");
    ctx.reply(typeof sessionIdCookie);
  }
};