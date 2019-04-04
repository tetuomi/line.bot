const path = require("path");
const express = require("express");
const line = require("@line/bot-sdk");

const lineConfig = {
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.LINE_CHANNEL_SECRET
};
const lineClient = new line.Client(lineConfig);

function firstMessage(input){
  return {
    type: "text",
    text: "小坂菜緒か広瀬すず♡"
  };
}

function createReplyMessage(input) {
  // 3. 画像を返す
  const appUrl = process.env.HEROKU_APP_URL;
  const hands = ["小坂菜緒", "広瀬すず"];
  let text;
  if(hands.indexOf(input) == -1){
    return{
    type: "image",
    previewImageUrl: `${appUrl}/images/akitake.jpg`,
    originalContentUrl: `${appUrl}/images/akitake.jpg`
    };
  }
  else if(hands.indexOf(input) == 0){
    return {
    type: "image",
    previewImageUrl: `${appUrl}/images/kosakana.jpeg`,
    originalContentUrl: `${appUrl}/images/kosakana.jpeg`
    };
  }
  else if(hands.indexOf(input) == 1){
    return {
    type: "image",
    previewImageUrl: `${appUrl}/images/hirosuzu.jpg`,
    originalContentUrl: `${appUrl}/images/hirosuzu.jpg`
    };
  }
  // メッセージオブジェクトに関する公式ドキュメント
  // https://developers.line.me/ja/reference/messaging-api/#message-objects
}

const server = express();//以下サーバー起動

server.use("/images", express.static(path.join(__dirname, "images")));//画像返す

server.post("/webhook", line.middleware(lineConfig), (req, res) => {
  // LINEのサーバーに200を返す
  res.sendStatus(200);

  for (const event of req.body.events) {
    if (event.type === "message" && event.message.type === "text") {
      const message0 = firstMessage(event.message0.text);
      lineClient.replyMessage(event.replyToken, message0);

      const message = createReplyMessage(event.message.text);
      lineClient.replyMessage(event.replyToken, message);//メッセージを届ける
    }
  }
});

server.listen(process.env.PORT || 8080);
