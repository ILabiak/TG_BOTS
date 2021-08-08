'use strict';

const { secureHeapUsed } = require('crypto');
const https = require('https');
const fetch = require('node-fetch');
/*    
        'name': 'sessionid',
        'value': '6386692072%3AkVdQbyP7TDzXFK%3A9',
        'domain': 'instagram.com',
        'expires': 1659894211,
        'secure': true,
        "user=John; path=/; expires=Tue, 19 Jan 2038 03:14:07 GMT"
*/

/* let res = https.get('https://www.instagram.com/',{
    headers: {'Cookie': 'sessionid=6676764249%3AatMChwpRYeS4zA%3A9; Expires=1659894211; Domain=.instagram.com; Secure;'}
}) */
(async()=>{
    let res = await fetch('https://www.instagram.com/',{
        headers: {'Cookie': 'sessionid=6676764249%3AatMChwpRYeS4zA%3A9; Domain=.instagram.com; '}
    })
    .then(res => res.text())
    .then(body => body.includes('viewer":{"biography'));
    
    console.log(res + 'lol')

})()