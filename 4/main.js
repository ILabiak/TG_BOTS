const QiwiApi = require('./qiwi')


const api = new QiwiApi({
  accessToken: "", // Токен кошелька https://qiwi.com/api
  personId: "" // Номер кошелька
});

const receivePayment = async(paymentComment, sum) =>{
txsList = await api.transactionsList();
txArr = txsList.data

 for(let el of txArr){
    if(el.sum.amount == sum && el.comment.includes(paymentComment)){
        console.dir(el)
    }
} 
}

(async()=>{

    await receivePayment('2809477',100)
})()