'use strict';

const fetch = require('node-fetch');

const checkForValid = (async(sessionIdCookie) => {
    if(typeof(sessionIdCookie)=== 'string'){
        let res = await fetch('https://www.instagram.com/',{
            headers: {'Cookie': `sessionid=${sessionIdCookie}; Domain=.instagram.com; `}
        })
        .then(res => res.text())
        .then(body => {
            let data = [];
            let arr = body.split('\n');
            for(let el of arr){
                if(el.includes('viewer":{"biography')){
                    data.push(el);
                }
            }
            if(data[0]){
                let text = data[0];
                let usernameStart = text.indexOf('username":"')+11;
                let usernameEnd = text.indexOf('","badge_count"');
                let username = text.slice(usernameStart,usernameEnd);
                let usernameOutput = `https://www.instagram.com/${username}/`;
                return `Валид\n${usernameOutput}`;
            }else{
                return 'Невалид';
            }
        })
        return res; 
    }else{
        ctx.reply('wrong format');
        ctx.reply(typeof(sessionIdCookie));
    }
});

(async()=>{

let res  = await checkForValid('198404570%3AzaNKYcYR1xgwAY%3A19')
console.log(res)

})()