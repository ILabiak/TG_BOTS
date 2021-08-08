const { Telegraf} = require('telegraf')
const fetch = require('node-fetch');
const fs = require('fs');


const bot = new Telegraf('1928863484:AAGls_cY8lSsbrPuPc41VowdBAE_S89WFsA')
    bot.start((ctx) => ctx.reply('Привет, это чекер куков Instagram!'))
    bot.use()
    bot.launch()
    bot.on('document', async(ctx) => {
      let fileId = ctx.update.message.document.file_id;
     // console.log(fileId);
      let link = await ctx.telegram.getFileLink(fileId);
     // console.log(link)
      await downloadFile(link);
      let cookies = await getSessionIds();
      let results = []
      for(let cookie of cookies){
        results.push(await checkForValid(cookie));
      }
      await ctx.reply(results.join('\n'));
      cookies = [];

    })

    const downloadFile = (async (url, path = './cookies/1.txt') => {
      const res = await fetch(url);
      const fileStream = fs.createWriteStream(path);
      await new Promise((resolve, reject) => {
          res.body.pipe(fileStream);
          res.body.on("error", reject);
          fileStream.on("finish", resolve);
        });
    });

    const getSessionIds = (async (path ='cookies/1.txt') => {
      let textArr = fs.readFileSync(path, 'utf8').split('\n');
      let sessionIds = [];
         for(let el of textArr){
         if(el.includes('.instagram.com') && el.includes('sessionid')){
      let start = el.lastIndexOf('\t')+1;
      let end = el.lastIndexOf('\r');
      let sessionId = el.slice(start,end);
      sessionIds.push(sessionId);
          }
       }
       return sessionIds;
    });

    const checkForValid = (async(sessionIdCookie) => {
      if(typeof(sessionIdCookie)=== 'string'){
          let res = await fetch('https://www.instagram.com/',{
              headers: {'Cookie': `sessionid=${sessionIdCookie}; Domain=.instagram.com; `}
          })
          .then(res => res.text())
          .then(body =>{
            if(body.includes('viewer":{"biography')){
              return 'Валид';
            }else return 'Невалид';
            })
          return res;
      }else{
          ctx.reply('wrong format');
          ctx.reply(typeof(sessionIdCookie));
      }
  });