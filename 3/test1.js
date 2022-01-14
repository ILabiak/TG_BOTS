"use strict";

const fs = require("fs");
const https = require("https");
const archiver = require("archiver");
let { zip, unzip } = require("cross-unzip");
const { waitForDebugger } = require("inspector");

const txtFiles = [
  './3/download/(1)instagram.com/instagram.com/ZA[A8FA9DC44ADD46A81E80B895269CA627] [2021-12-21T01_42_36.5014011]/Cookies.txt',
  './3/download/(1)instagram.com/instagram.com/ZA[C647006E0E860078B7147BAF147D5425] [2021-12-17T16_37_48.5847331]/Cookies.txt',
  './3/download/(1)instagram.com/instagram.com/ZA[D73072CE5B3B07F389870A1E650AD3AE] [2021-12-26T07_22_38.5346297]/Cookies.txt',
  './3/download/(1)instagram.com/instagram.com/ZA[DD1A169AF0CF44C00E7688CD512B8634] [2021-12-17T16_26_04.6471553]/Cookies.txt',
  './3/download/(1)instagram.com/instagram.com/ZA[FB406C16483DB807B70E14C00B3A8496] [2021-12-20T20_13_34.7873521]/Cookies.txt',
  './3/download/(1)instagram.com/instagram.com/ZA[FC30E8BD7E3822ED21C40F54442DAFC7] [2021-12-24T15_37_24.5601918]/Cookies.txt',
  './3/download/(1)instagram.com/instagram.com/ZM[E334C8F5F2671395F38E7373FB143CE1] [2021-12-22T15_15_08.0742785]/Cookies.txt',
  './3/download/(1)instagram.com/instagram.com/ZW[1FFF50845189B1BB3940E94F9341E7B0] [2021-12-25T07_44_03.1419729]/Cookies.txt'
]

for(let path of txtFiles){
  let characterCount = (path.match(new RegExp("/", "g")) || []).length;
  let newPath;
  console.log(characterCount)
  if (characterCount > 4) {
    let index = path.split("/", 4).join("/").length;
    path = path.slice(0, index) + "_result" + path.slice(index);
    newPath =
      path.slice(0, path.lastIndexOf("_result") + 7) +
      path.slice(path.lastIndexOf("/"));
  } else {
    let index = path.lastIndexOf("/");
    newPath = path.slice(0, index) + "_result" + path.slice(index);
  }
  console.dir(newPath)
}
