const express = require("express");
const line    = require("@line/bot-sdk");
const pg      = require("pg");
const config  = require("./config.json");

const pool1 = new pg.Pool(config.db.postgres);//取り出し
const pool2 = new pg.Pool(config.db.postgres);//保存

const lineConfig = {
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
  channelSecret:      process.env.LINE_CHANNEL_SECRET
};

const lineClient = new line.Client(lineConfig);
const server     = express();

const questions = ["dog","cat","bird","monkey"];
const answers = ["犬","猫","鳥","猿"];

const TextMessages = (text) => {
  return {
    type: "text",
    text: text
  };
}

var number;

server.post("/webhook", line.middleware(lineConfig), (req, res) => {
  res.sendStatus(200);
  for (const event of req.body.events) {
    if (event.source.type == "user" && event.type == "message" && event.message.type == "text") {
      if(event.message.text == "単語"){
        //numに０を保存
        pool2.connect((err, client, done) => {
          const query = "INSERT INTO words (user_id, num) VALUES ("
            +"'"+event.source.userId+"', "+ `0` +");";
          console.log("query: " + query);
          client.query(query, (err, result) => {
            done();
            let messages = [];
            messages.push(TextMessages(questions[0]));
            if(!err){
              lineClient.replyMessage(event.replyToken,messages);
            }
          });
        });
      }
      else{
        pool1.connect((err, client, done) => {   //numの取り出し
          const query = "SELECT * FROM words WHERE user_id = '"+event.source.userId+"';";
          client.query(query, (err, result) => {
            let messages = [];
            let buff = [];
            for(const row of result.rows){
              buff.push(row.num);
            }
            done();
            console.log("buff :" + buff.slice(-1));
            messages.push(TextMessages(event.message.text == answers[parseInt(buff.slice(-1))]?"大正解！！":"ぶ～～～"));
            messages.push(TextMessages(questions[parseInt(buff.slice(-1))] + "  >>>>>  " + answers[parseInt(buff.slice(-1))]));
            messages.push(TextMessages(questions[event.message.text == answers[parseInt(buff.slice(-1))]? (parseInt(buff.slice(-1),10) + 1):parseInt(buff.slice(-1))]));
            lineClient.replyMessage(event.replyToken, messages);
            console.log(messages);
            number = (event.message.text == answers[buff.slice(-1)])? (parseInt(buff.slice(-1),10) + 1):  parseInt(buff.slice(-1));
            console.log("number :" + number);
          });
        });
        //numの保存
          pool2.connect((err, client,done) => {
          const query = "INSERT INTO words (user_id, num) VALUES ("
            +"'"+event.source.userId+"', "+ number +");";
          console.log("query: " + query);
          client.query(query,(err, result) => {
          done();
          });
        });
      } 
    }
  }
});

server.listen(process.env.PORT || 8000);
