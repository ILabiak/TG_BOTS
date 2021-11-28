'use strict';

const fs = require("fs");
const https = require('https');
let { zip, unzip } = require('cross-unzip');
const { waitForDebugger } = require("inspector");


//let filename = './3/download/(1)(1)Instagram_cookies.rar'
let filename = './3/download/Insta.zip'


const downloadFile = async (url, path = "./3/download/",filename) => {

    const dirnames = await fs.readdirSync('./3/download',)
    while(dirnames.includes(filename)){                           // FIXXXXXXX
        filename = '(1)'+ filename
    }
    const fileStream = await fs.createWriteStream(path + filename);

    const promise = new Promise(async function(resolve, reject){
        await https.get(url, async function(response) {
            await response.pipe(fileStream).on('finish',function(){
                resolve();
            });
           })
        })
      await promise.then(function(results){
        console.log('done')
      })

}

(async() =>{
console.log('1')
await downloadFile('https://api.telegram.org/file/bot2119954532:AAFaEi3TgMriIT5-Ui97pu4tkFDBhd8fWmA/documents/file_0.zip','./3/download/','1.zip')
console.log('2')
})()