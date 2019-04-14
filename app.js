'use strict';

const express = require('express');
const line = require('@line/bot-sdk');
const axios = require('axios');
const PORT = process.env.PORT || 3000;

const config = {
    channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
    channelSecret: process.env.LINE_CHANNEL_SECRET
};

const app = express();

app.post('/webhook', line.middleware(config), (req, res) => {
    console.log(req.body.events);
    Promise
      .all(req.body.events.map(handleEvent))
      .then((result) => res.json(result));
});

const client = new line.Client(config);

function handleEvent(event) {
  if (event.type !== 'message' || event.message.type !== 'text') {
    return Promise.resolve(null);
  }

  let mes = ''
  if(event.message.text === '天気教えて！'){
    mes = 'ちょっとまってね'; //待ってねってメッセージだけ先に処理
    getNodeVer(event.source.userId); //スクレイピング処理が終わったらプッシュメッセージ
  }else{
    mes = event.message.text;
  }

  return client.replyMessage(event.replyToken, {
    type: 'text',
    text: mes
  });
}

const getNodeVer = async (userId) => {
    const res = await axios.get('http://weather.livedoor.com/forecast/webservice/json/v1?city=400040');
    const item = res.data;

    await client.pushMessage(userId, {
        type: 'text',
        text: item.description.text,
    });
}

app.listen(PORT);
console.log(`Server running at ${PORT}`);