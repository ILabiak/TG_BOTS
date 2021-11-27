'use strict';

const fs = require("fs");
let { zip, unzip } = require('cross-unzip')

const dirnames = fs.readdirSync('./3')
const filename = './3/download/insta.zip'


const extractArchieve = (filename) =>{
    const newDir =filename.slice(0,-4);
    if (!fs.existsSync(newDir)){
        fs.mkdirSync(newDir);
    }
    unzip(filename, newDir, err => {
        console.log(err)
      })
      return true;
}


//console.log(filename.slice(0,-4))
extractArchieve(filename)