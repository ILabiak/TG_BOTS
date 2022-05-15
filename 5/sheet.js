'use strict'
const { dirname } = require('path');
const fs = require('fs')
const https = require('https');
const dir = __dirname
const XLSX = require('xlsx');

const neededStations = [40562100, 40515300, 40562000]


//download xlsx file from https://www.okko.ua/
const file = fs.createWriteStream(dir + "\\file.xlsx");
const request = https.get("https://www.okko.ua/api/uk/exportExcel/gas_stations?filter[gas_stations,fuel_type]=252&", function(response) {
   response.pipe(file);
   file.on("finish", () => {
       file.close();
       console.log("Download Completed");
   });
});


// read xls file and write it to json.
/* var workbook = XLSX.readFile(dir + '\\gas-stations.xlsx');
var sheet_name_list = workbook.SheetNames;
const gasInfoArr = XLSX.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]])
fs.writeFile(dir + '\\gasinfo.json', JSON.stringify(gasInfoArr), 'utf8', function(err) {
    if (err) console.log('ERROR');
    console.log('Complete');
    }); */
//

//filter stations
/* let allStationsInfo = require(dir + '\\gasinfo.json')
let gasInfo = allStationsInfo.filter(el => neededStations.includes(el.OKKO))

//find station that have specific fuel
let goodStations = []
for(let el of gasInfo){
    let desc = el.__EMPTY_6
     if(desc.includes('За готівку і банківські картки доступно')){
        desc = desc.slice(0, desc.indexOf('З паливною карткою і талонами доступно'))
        if(desc.includes('ГАЗ')){//change to А-
            goodStations.push(el)
        }
    } 
}

for(let el of goodStations){ //газ замінити на А-95
    let res =  `Знайдено заправку з газом
Населений пункт: ${el.__EMPTY}
Адреса: ${el.__EMPTY_1}
Наявність: ${el.__EMPTY_6}`
console.log(res)
} */


