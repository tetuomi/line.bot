const express = require("express");
const line    = require("@line/bot-sdk");
const pg      = require("pg");
const config  = require("./config.json");

const pool1 = new pg.Pool(config.db.postgres);//保存
const pool2 = new pg.Pool(config.db.postgres);//取り出し

const lineConfig = {
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
  channelSecret:      process.env.LINE_CHANNEL_SECRET
};

const lineClient = new line.Client(lineConfig);
const server     = express();

const questions = ["dog","cat","bird"];
const answers = ["犬","猫","鳥"];

const TextMessages = (text) => {
  return {
    type: "text",
    text: text
  };
}

server.post("/webhook", line.middleware(lineConfig), (req, res) => {
  res.sendStatus(200);
  for (const event of req.body.events) {
    if (event.source.type == "user" && event.type == "message" && event.message.type == "text") {
      if(event.message.text == "単語"){
        //numに０を保存
        pool1.connect((err, client, done) => {
          const query = "INSERT INTO words (user_id, num) VALUES ("
            +"'"+event.source.userId+"', '"+ 0 +"');";
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
        pool2.connect((err, client, done) => {   //numの取り出し
          const query = "SELECT * FROM words WHERE user_id = '"+event.source.userId+"';";
          client.query(query, (err, result) => {
            let messages = [];
            done();
            messages.push(TextMessages(event.message.text == answers[result.rows.num]?"大正解！！":"ぶ～～～"));
            messages.push(TextMessages(answers[result.rows.num]));
            messages.push(TextMessages(event.message.text == answers[result.rows.num]?
              questions[result.rows.num + 1] : questions[result.rows.num]));
            lineClient.replyMessage(event.replyToken, messages);
            const x =(event.message.text == answers[result.rows.num])? result.rows.num + 1 : result.rows.num;
          });
        });
        //numの保存
          pool1.connect((err, client,done) => {
          const query = "INSERT INTO words (user_id, num) VALUES ("
            +"'"+event.source.userId+"', '"+ x +"');";
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
