"use strict";

const fetch = require("node-fetch");

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

(async () => {
  console.log(await checkForValid("198404570%3AzaNKYcYR1xgwAY%3A19"));
  //console.log(res)
})();
