const { Bot } = require("grammy");
const express = require("express")
const bodyParser = require("body-parser");
const cors = require("cors");
const { Client, Message } = require('paho-mqtt')
// const { Telegraf } = require('telegraf')
// const {Coin98Payment} = require('coin98_telegram_payment/dist/coin98_telegram_payment.esm')

global.WebSocket = require('ws');
const app = express();

app.use(cors());
app.use(bodyParser.json());




 class MqttService {
    clientId = `Victoriaxaoquet`
    requestUrl = `wss://a232wgcz1uajvt-ats.iot.ap-southeast-1.amazonaws.com/mqtt?x-amz-customauthorizer-name=PublicAuthorizerWillDelete`
  
    mqttClient
    constructor() {
      this.mqttClient = new Client(this.requestUrl, this.clientId)
      this.mqttClient.onConnectionLost = this.onConnectionLost
      const options = {
        userName: 'username',
        password: 'password',
        onSuccess: this.onConnect,
        onFailure: this.onFailure,
        useSSL: true,
        reconnect: true,
        keepAliveInterval: 30,
        timeout: 10
      }
      this.mqttClient.connect(options)
    }
  
    onConnect = () => {
      console.log('🔥 ~ Connected to AWS IoT Core')
    }
  
    onFailure = (error) => {
      console.error('🔥 ~ MqttService ~ onFailure ~ error:', error)
    }
  
    onConnectionLost(error) {
      console.log('🔥 ~ MqttService ~ onConnectionLost ~ e:', error)
      // this.mqttClient.connect({ onSuccess: this.onConnect, onFailure: this.onFailure, useSSL: true, timeout: 3 })
    }
  
    async sendMessage(topic, message) {
      try {
        const messageObj = new Message(JSON.stringify(message))
        messageObj.destinationName = topic
        messageObj.qos = 1
        messageObj.retained = false
        this.mqttClient.send(messageObj)
      } catch (error) {
        console.log('MqttService ~ sendMessage ~ error', JSON.stringify({ topic, message }))
      }
    }
  } 

const abc = new MqttService()


const bot = new Bot("7448915959:AAFtz2CNxUh9ek3SgYBTWFI9jPCkDYo_u28");



app.get('/', function (_req, res) {
    res.send('Welcome to Victoria xao quyet bot API')
})

app.post('/request-payment', async (req, res) => {

    const params = req.body
   
    const message = await bot.api.sendInvoice( params.chatId,
        // "Victoria xảo quyệt", // Product title
        // "Victoria xảo quyệt ngont hơn ghệ của bạn", // Product description
        // "{}", // Product payload, not required for now
        // "XTR", // Stars Currency 
        // [{ amount: 1, label: "Hãy đến với anh một đêm nào" }],
        // {
        //   photo_url: 'https://photo-cms-smoney.epicdn.me/w700/Uploaded/2024/jhvkbun/2024_03_08/n-znews-2157.jpg',
        //   start_parameter: new Date().getTime()
        // }
        params?.product?.title,
        params?.product?.description,
        params?.product?.payload || '{}',
        params?.product?.currency,
        params?.product?.variants,
        {
            photo_url: params?.product.photo_url,
            start_parameter: params?.product.start_parameter
        }
      )


    res.status(200).json(message);
    
})


bot.command("start", (ctx) => {
    console.log("🚀 ~ bot.command ~ ctx:", ctx?.update?.message?.from)

    return ctx.reply(`Nen goi la Thang :

/pay - to pay`)});

bot.command("pay", (ctx) => {
    return ctx.replyWithInvoice(
      "Eternals", // Product title
      "<b>addasdasdasd</b>", // Product description
      "{}", // Product payload, not required for now
      "XTR", // Stars Currency 
      [{ amount: 1, label: "Hãy đến với anh một đêm nào" }, // Product variants
    ]);
});

bot.on("pre_checkout_query", (ctx) => {
    console.log("🚀 ~ bot.on ~ ctx:", ctx)
    return ctx.answerPreCheckoutQuery(true).catch(() => {
      console.error("answerPreCheckoutQuery failed");
    });
});


// // Map is used for simplicity. For production use a database
const paidUsers = new Map();


bot.command("status", (ctx) => {
  const message = paidUsers.has(ctx.from.id)
    ? "You have paid"
    : "You have not paid yet";
  return ctx.reply(message);
});



bot.on("message:successful_payment", (ctx) => {
  abc.sendMessage('payment', 'Thành công rồi á nha')
  if (!ctx.message || !ctx.message.successful_payment || !ctx.from) {
    return;
  }

  paidUsers.set(
    ctx.from.id,
    ctx.message.successful_payment.telegram_payment_charge_id,
  );

  console.log(ctx.message.successful_payment);

});


bot.start();

app.listen(8080, () => {
    console.log("listen")
});
