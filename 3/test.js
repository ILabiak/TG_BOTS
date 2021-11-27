'use strict';

const fs = require("fs");
let { zip, unzip } = require('cross-unzip')

const dirnames = fs.readdirSync('./3')
const filename = './3/download/insta.zip'
const dir = './3/download/insta'


const extractArchieve = (filename) =>{
    const newDir =filename.slice(0,-4);
    if (!fs.existsSync(newDir)){
        fs.mkdirSync(newDir);
    }
    unzip(filename, newDir, err => {

      })
      return newDir;
}

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
console.dir(getTxtfiles(dir))