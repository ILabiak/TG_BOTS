'use strict';
const config = require('./config/config.json');
const axios = require('axios');

module.exports = {addPayment}

    async function addPayment(username,amount) {
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

    async function getServices() {
const res = await axios.get(`https://nakru-ti.ru/api/v2/?key=${config.website_token}&action=services`).then((response) => {
    return response.data
    });
    return res;
    }
    
    (async() => {
        console.dir(await getServices())
    })()
