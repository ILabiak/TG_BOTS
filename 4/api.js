'use strict';
//const request = require('request');
const config = require('./config/config.json');
const axios = require('axios');

const makePayment = async(username,amount) => {

    const res = await axios.post('https://nakru-ti.ru/adminapi/v1', {
        key: config.website_admin_token,
        action: 'addPayment',
        username: username,
        amount: amount.toString()
    
    }).then((response) => {
    return response.data
    });
    if(res.status =='success'){
        return 1;
    }else{
        return 0;
    }

}


(async() => {

console.log(await makePayment('frozzz',1))

})()








/* const makePayment = async(username, amount) =>{
    request.post(
        '	https://nakru-ti.ru/adminapi/v1',
        { json: { 
        key: config.website_admin_token,
        action: 'addPayment',
        username: username,
        amount: amount.toString()
     }},
        async function (error, response) {
            if(error)return 0;
            if (!error && response.statusCode == 200) {

            }
        }
    );
    return sample;
} */
/* 
(async() => {
console.dir(await makePayment('frozzz',0))
})()
 */