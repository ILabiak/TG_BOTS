'use strict';

const fs = require("fs");
let { zip, unzip } = require('cross-unzip');
const { waitForDebugger } = require("inspector");


//let filename = './3/download/(1)(1)Instagram_cookies.rar'
let filename = './3/download/Insta.zip'


const downloadFile = async (url, path = "./3/download/",filename) => {
    const dirnames = await fs.readdirSync('./3/download',)
    while(dirnames.includes(filename)){                           // FIXXXXXXX
        filename = '(1)'+ filename
    }
    const fileStream = fs.createWriteStream(path + filename);
    await https.get(url, async function(response) {
 await response.pipe(fileStream);
});
return path + filename;
  };

(async() =>{
console.log('1')
await extractArchieve(filename, './3/download/Insta')
console.log('2')
})()