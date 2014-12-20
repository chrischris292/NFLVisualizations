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
var pbpData = []
var i = 0;

var csvStream = csv.fromStream(stream,{headers:true})
    .on("data", function(data){
      if(data.OffenseTeam=="SEA"){
        var gameID = data.GameId
        if(pbpData[gameID]==undefined)
        {
          pbpData[gameID] = [data];
        }
        else
        {
          pbpData[gameID].push(data)
        }
      }
    })
    .on("end", function(){
    });

//Temp communication to front end for testing. 
app.get('/data', function(req, res){
    var asJSON = JSON.stringify(pbpData);
     res.send(pbpData)
})

//Data structure for NFL data
function nflData(){
  this.gameID

}