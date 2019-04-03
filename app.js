const path = require("path");
const express = require("express");
const line = require("@line/bot-sdk");

const lineConfig = {
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.LINE_CHANNEL_SECRET
};
const lineClient = new line.Client(lineConfig);

function createReplyMessage(input) {
  // 3. 画像を返す

  const appUrl = process.env.HEROKU_APP_URL;
  return {
    type: "image",
    previewImageUrl: `${appUrl}https://www.google.com/search?q=%E5%B0%8F%E5%9D%82%E8%8F%9C%E7%B7%92&source=lnms&tbm=isch&sa=X&ved=0ahUKEwja4OXLirPhAhVaFogKHXhiDBIQ_AUIDigB&biw=852&bih=827&dpr=1.13#imgrc=zz-B7rMlnFZgoM:`,
    originalContentUrl: `${appUrl}https://www.google.com/search?q=%E5%B0%8F%E5%9D%82%E8%8F%9C%E7%B7%92&source=lnms&tbm=isch&sa=X&ved=0ahUKEwja4OXLirPhAhVaFogKHXhiDBIQ_AUIDigB&biw=852&bih=827&dpr=1.13#imgrc=zz-B7rMlnFZgoM:`
  };

  // メッセージオブジェクトに関する公式ドキュメント
  // https://developers.line.me/ja/reference/messaging-api/#message-objects
}

const server = express();

server.use("/images", express.static(path.join(__dirname, "images")));

server.post("/webhook", line.middleware(lineConfig), (req, res) => {
  // LINEのサーバーに200を返す
  res.sendStatus(200);

  for (const event of req.body.events) {
    if (event.type === "message" && event.message.type === "text") {
      const message = createReplyMessage(event.message.text);
      lineClient.replyMessage(event.replyToken, message);
    }
  }
});

server.listen(process.env.PORT || 8080);
