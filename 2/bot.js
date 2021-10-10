"use strict";

const { Telegraf, Extra } = require("telegraf");
const fetch = require("node-fetch");
const fs = require("fs");

const bot = new Telegraf("token");
bot.start((ctx) => ctx.reply("Привет, это чекер куков Instagram!"));
bot.use();
bot.launch();
bot.on("document", async (ctx) => {
  let messageId = ctx.update.message.message_id;
  let fileId = ctx.update.message.document.file_id;
  // console.log(fileId);
  let link = await ctx.telegram.getFileLink(fileId);
  // console.log(link)
  await downloadFile(link);
  let cookies = await getSessionIds();
  let results = [];
  for (let cookie of cookies) {
    results.push(await checkForValid(cookie));
  }
  await ctx.reply(results.join("\n"), Extra.inReplyTo(messageId));
  cookies = [];
  results = [];
});

const downloadFile = async (url, path = "./cookies/1.txt") => {
  const res = await fetch(url);
  const fileStream = fs.createWriteStream(path);
  await new Promise((resolve, reject) => {
    res.body.pipe(fileStream);
    res.body.on("error", reject);
    fileStream.on("finish", resolve);
  });
};

const getSessionIds = async (path = "cookies/1.txt") => {
  let textArr = fs.readFileSync(path, "utf8").split("\n");
  let sessionIds = [];
  for (let el of textArr) {
    if (el.includes(".instagram.com") && el.includes("sessionid")) {
      console.dir(el)
      let start = el.lastIndexOf("\t") + 1;
      let end = el.lastIndexOf("\r");
      let sessionId;
      if(end < start){
        sessionId = el.slice(start);
      }else{
        sessionId = el.slice(start, end);
      }
      sessionIds.push(sessionId);
    }
  }
  return sessionIds;
};

const checkForValid = async (sessionIdCookie) => {
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
          let text = data[0];
          let usernameStart = text.indexOf('username":"') + 11;
          let usernameEnd = text.indexOf('","badge_count"');
          let username = text.slice(usernameStart, usernameEnd);
          let usernameOutput = `https://www.instagram.com/${username}/`;

          let secondRequest = await fetch(usernameOutput, {
            headers: {
              Cookie: `sessionid=${sessionIdCookie}; Domain=.instagram.com; `,
            },
          })
            .then((secondRequest) => secondRequest.text())
            .then((body) => {
              let data = [];
              let arr = body.split("\n");
              for (let el of arr) {
                if (el.includes('<meta content="')) {
                  data.push(el);
                }
              }
              if (data[0]) {
                let text = data[0];
                let startStr = text.indexOf('content="') + 9;
                let endStr = text.indexOf("- See Instagram photos");
                let accountInfo = text.slice(startStr, endStr);
                return `${usernameOutput}\n${accountInfo}`;
              }else{
                return 'Couldn\'t find account data';
              }
            });
          return secondRequest;
        } else {
          return "Невалид";
        }
      });
    return request;
  } else {
    ctx.reply("wrong format");
    ctx.reply(typeof sessionIdCookie);
  }
};

bot.on('sticker', async (ctx) =>{
  //console.log(ctx.update.message.message_id);
  let messageId = ctx.update.message.message_id;
  ctx.reply('response', Extra.inReplyTo(messageId))
})