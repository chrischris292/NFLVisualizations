// Setup basic express server
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var port = process.env.PORT || 3000;
var csv = require('fast-csv');
var fs = require('fs');


server.listen(port, function () {
  console.log('Server listening at port %d', port);
});

// Routing
app.use(express.static(__dirname + '/public'));

var stream = fs.createReadStream(__dirname + '/data/pbp-2014.csv');

// Chatroom
//my own stuff
pbpData = []
var csvStream = csv.fromStream(stream,{headers:true})
    .on("data", function(data){
      pbpData.push(data)
      //messageData.push(data);
      //setUpMispelledWords(data);
      //setUpFrequentWords(data);
      //setUpFrequentWordsNames(data);
    })
    .on("end", function(){
      console.log(pbpData)
      //sortMessages();
      //sortFrequentWords();
        //createSubTitle(messageData)
        //findMostFrequentName();
       // mostFrequentAtTime();
        //sentimentAtTimes();
        //console.log(mostFrequentWordsName)

    });