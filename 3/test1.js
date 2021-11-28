'use strict';

const fs = require("fs");
const https = require('https');
const archiver = require('archiver');
let { zip, unzip } = require('cross-unzip');
const { waitForDebugger } = require("inspector");


//let filename = './3/download/(1)(1)Instagram_cookies.rar'
let filename = './3/download/Insta.zip'


 const makeArchieve = async(dir) =>{
    let name = dir +'.zip'
    console.log(name)
    
    const promise = new Promise(async function(resolve, reject){
        let output = await fs.createWriteStream(name);
        let archive = archiver('zip');

        output.on('close', function () {
            //console.log(archive.pointer() + ' total bytes');
           // console.log('archiver has been finalized and the output file descriptor has closed.');
            resolve();
        });
        archive.on('error', function(err){
            throw err;
        });
        
        await archive.pipe(output);
        await archive.directory(dir, false);
        await archive.directory('subdir/', 'new-subdir');
        await archive.finalize();
        })
    
      await promise.then(function(results){
        console.log('done making archieve')
      })
    return name;
} 

/* const makeArchieve = async(dir) =>{
    //console.dir({filename,newDir})
    const filename = dir + '.zip'
    const promise = new Promise(function(resolve, reject){
        zip(dir, filename, function(response) {
            resolve();
        })})
    
      await promise.then(function(results){
        console.log('done making archieve')
      })
  }  */

(async() =>{
console.log('1')
await makeArchieve('./3/download/insta_result')
console.log('2')
})()