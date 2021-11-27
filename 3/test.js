'use strict';

const fs = require("fs");
const dirnames = fs.readdirSync('./3')
const filename = './3/download/Instagram_cookies.rar'


const extractArchieve = (filename) =>{
    const newDir =filename.slice(0,-4);
    if (!fs.existsSync(newDir)){
        fs.mkdirSync(newDir);
    }
    fs.createReadStream(filename).pipe(unzip.Extract({ path: newDir }));
}


//console.log(filename.slice(0,-4))
extractArchieve(filename)