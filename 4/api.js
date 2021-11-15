'use strict';
const config = require('./config/config.json');
const axios = require('axios');

module.exports = {addPayment, getServices, makeOrder, getOrderStatus, getCategories, getCategoryServices, getServiceDetails}

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

    async function makeOrder(serviceId, quantity, link) {
        const res = await axios.get(`https://nakru-ti.ru/api/v2/?key=${config.website_token}&action=add&service=${serviceId}&quantity=${quantity}&link=${link}`)
        .then((response) => {
            return response.data
            });
            if(res.order) return res.order;
            return false;
    }
        
    async function getOrderStatus(orderId) {
        const res = await axios.get(`https://nakru-ti.ru/api/v2/?key=${config.website_token}&action=status&order=${orderId}`)
        .then((response) => {
            return response.data
            });
        if (res.start_count == null) res.start_count = ''
        let translate = {
            "Pending": "В ожидании",
            "Completed": "Завершено",
            "Partial": "Выполнено частично",
            "Canceled": "Отменено",
            "Processing": "В обработке",
            "In progress": "В ходе выполнения",
            "Fail" : "Возникла ошибка"
        }
        let status = 
`Цена: ${res.charge} руб.
Статус: ${translate[res.status]}
Изначально: ${res.start_count}
Остается: ${res.remains}`
        return status;
    }

    function getCategories(arr){
        let categories = [];
        for(let obj of arr){
    if(!categories.includes(obj.category)){
        categories.push(obj.category)
    }
        }
        return categories;
    }
    
    function getCategoryServices(arr, category){
    let services = [];
    for(let obj of arr){
        if(obj.category.includes(category)){
            services.push(`${obj.name} - ${obj.rate} руб.`)
        }
    }
    return services;
    }

    async function getServiceDetails(arr,serviceId){
    let text;
    let min, max;
for(let obj of arr){
    let str = obj.name;
    let index = str.indexOf(':')
    let id = str.slice(2,index);
    if(id == serviceId){ 
    min = obj.min
    max = obj.max
    text = `
Цена: ${obj.rate} руб.
Минимальный заказ: ${obj.min}
Максимальный заказ: ${obj.max}
`
       }
    }
    return {text, min,max};
    }
    (async() => {

   // console.log(await getOrderStatus(32593))
    })()