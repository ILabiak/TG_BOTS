const Stage = require('telegraf/stage')
const Scene = require('telegraf/scenes/base')
const Extra = require('telegraf/extra')
const Markup = require('telegraf/markup')
const { enter, leave } = Stage
const QiwiApi = require('./qiwi')
const api = require('./api');


const paymentAmountScene = new Scene('paymentAmount')
paymentAmountScene.enter(({ reply }) =>
reply( 'Введите сумму пополнения(не менее 0 рублей):' , Markup
  .keyboard(['Меню']).oneTime().resize().extra()
))
paymentAmountScene.hears('Меню', leave('paymentAmount'))
paymentAmountScene.on('message', (ctx) => {
if(parseInt(ctx.message.text)>=0){
  let paymentAmount = ctx.message.text;
  ctx.scene.enter('paymentMethod', {amount : paymentAmount})
}
else{
  ctx.scene.enter('paymentAmount')
}
})


const paymentMethodScene = new Scene('paymentMethod')
paymentMethodScene.enter(({ reply }) =>
reply( 'Выберите способ оплаты:' , Markup
  .keyboard(['Qiwi', '...', 'Меню']).oneTime().resize().extra()
))
paymentMethodScene.hears('Меню', leave('greeter'))
paymentMethodScene.hears('Qiwi', (ctx) => {
  let paymentAmount = ctx.session.__scenes.state.amount;
  ctx.scene.enter('qiwiPayment', {amount : paymentAmount})
  })
paymentMethodScene.hears('...', leave('greeter'))
paymentMethodScene.on('message', (ctx) => ctx.reply('Message'))


const qiwiPaymentScene = new Scene('qiwiPayment')
qiwiPaymentScene.enter(async (ctx) =>{
  await ctx.reply('Перейдите по ссылке, оплатите, и нажмите кнопку \"Проверить оплату\"')
  ctx.reply(`https://qiwi.com/payment/form/99?amountInteger=${ctx.session.__scenes.state.amount}&amountFraction=0&currency=643&extra%5B%27comment%27%5D=${ctx.session.__scenes.expires}&extra%5B%27account%27%5D=${config.qiwi_number}&blocked%5B0%5D=comment&blocked%5B1%5D=account&blocked%5B2%5D=sum`,
  Markup.keyboard(['Проверить оплату', 'Меню']).oneTime().resize().extra())
})
qiwiPaymentScene.hears('Меню', leave('greeter'))
qiwiPaymentScene.hears('Проверить оплату', async (ctx) => {
  let paymentText = ctx.session.__scenes.expires.toString()
  let paymentAmount = ctx.session.__scenes.state.amount
  console.dir({paymentText,paymentAmount})
 let paymentRes = await receivePayment(paymentText,paymentAmount)
  if(paymentRes == 1){
  await  ctx.reply('Ваш баланс успешно пополнен')
  }else{
   await ctx.reply('Платеж не получен')
  }
})
qiwiPaymentScene.hears('...', leave('greeter'))
qiwiPaymentScene.on('message', (ctx) => {
console.dir(ctx.session.__scenes.state.amount)
})

const categoryScene = new Scene('category')
categoryScene.enter(async({ reply }) =>{
  const services = await api.getServices();
  const categories = await api.getCategories(services);
reply( 'Выберите категорию:' , Markup
  .keyboard(categories).oneTime().resize().extra()
)})
categoryScene.hears('Меню', leave('category'))
categoryScene.on('message', async (ctx) => {
  const services = await api.getServices();
  const categories = await api.getCategories(services);
if(categories.includes(ctx.update.message.text)){
  ctx.scene.enter('services', {category : ctx.update.message.text})
}
})

const servicesScene = new Scene('services')
servicesScene.enter(async(ctx) =>{
const category = ctx.session.__scenes.state.category
const servicesList = await api.getServices();
const services = await api.getCategoryServices(servicesList,category)
ctx.reply( 'Выберите услугу:' , Markup
  .keyboard(services).oneTime().resize().extra()
)})
servicesScene.hears('Меню', leave('services'))
servicesScene.on('message', async (ctx) => {
  if(ctx.update.message.text.includes('ID')){
    const str = ctx.update.message.text;
    const index = str.indexOf(':')
    const serviceId =str.slice(2,index);
    console.log(serviceId)
  }

})


module.exports = {paymentAmountScene, paymentMethodScene,qiwiPaymentScene, categoryScene, servicesScene}