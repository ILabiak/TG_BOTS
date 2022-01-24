"use strict";

const { get } = require("config");
const fs = require("fs");
const https = require("https");
const fetch = require("node-fetch");
const cookiefile = require('cookiefile')



const filePath = './3/download/1/Cookies.txt';




const getSessionIds = async (path) => {
  let textArr = fs.readFileSync(path, "utf8").split("\n");
 //console.dir(textArr)
  let instCookies = [];
  let cookie =[]
  for (let el of textArr) {
    if (el.includes(".instagram.com")) {
      const str = el.split( '\t' );
      cookie.push(str[ str.length - 2 ] + '=' + str[ str.length - 1 ].replace('\r', '') + '; Domain=.instagram.com;' );
    }
  }
  instCookies.push(cookie.join('\n'))
  return instCookies;
}

const checkForValid = async (cookies) => {
  if (typeof cookies === "string") {
    let request = await fetch("https://www.instagram.com/", {
      headers: {
        Cookie: cookies,
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
    ctx.reply(typeof cookies);
  }
};



(async () => {

 // let cookies = await getSessionIds(filePath)
  const cookiemap = new cookiefile.CookieMap('./3/download/1/Instagram_cookies87080271.txt')
  const cookies = cookiemap.toRequestHeader().replace ('Cookie: ','')
  console.dir(await checkForValid(cookies))
  
  })();