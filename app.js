const express = require("express");
const line    = require("@line/bot-sdk");
const pg      = require("pg");
const config  = require("./config.json");

const pool = new pg.Pool(config.db.postgres);

const lineConfig = {
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
  channelSecret:      process.env.LINE_CHANNEL_SECRET
};

const lineClient = new line.Client(lineConfig);
const server     = express();
const questions = ["dog","cat","bird"];
const answers = ["犬","猫","鳥"];
var messages = [];

function TextMessages(text){
  return {
    text: "text",
    text: text
  };
};

if(input == "単語"){
  messages.push(Textmessages(questions[0]));
  //numに０を保存
  pool.connect((err, client, done) => {
    const query = "INSERT INTO words (user_id, num) VALUES ("
      +"'"+event.source.userId+"', '"+ 0 +"');";
    client.query(query, (err, result) => {
      done();
      if (!err) {
        lineClient.replyMessage(event.replyToken, TextMessages(questions[0]));
      }
    });
  });
}
else{
  //numの取り出し
  pool.connect((err, client, done) => {
    const query = "SELECT * FROM words WHERE user_id = '"+event.source.userId+"';";
    client.query(query, (err, result) => {
      done();
      messages.push((event.message.text == answers[result.rows.num])? Textmessages("大正解！！") : TextMessages("ぶ～～～"));
      messages.push(Textmessages(answers[result.rows.num]));
      messages.push((event.message.text == answers[result.rows.num])? TextMessages(questions[result.rows.num + 1]) : Textmessages(questions[result.rows.num]));
      lineClient.replyMessage(event.replyToken, messages);
    });
  });
  //numの保存
    let x =(event.message.text == answers[result.rows.num])? result.rows.num + 1 : result.rows.num;
    pool.connect((err, client, done) => {
    const query = "INSERT INTO words (user_id, num) VALUES ("
      +"'"+event.source.userId+"', '"+ x +"');";
    client.query(query, (err, result) => {
      done();
    });
  });
}

server.listen(process.env.PORT || 8000);