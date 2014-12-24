// Setup basic express server
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var port = process.env.PORT || 3000;
var csv = require('fast-csv');
var fs = require('fs');
var MongoClient = require('mongodb').MongoClient;
// Routing
app.use(express.static(__dirname + '/public'));
server.listen(port, function () {
  console.log('Server listening at port %d', port);
});
var pbpData = []
var keyArray
var i = 0;
getKeys();

function querySeahawksPlays(db){
  var penaltyData = [];
  for(key in keyArray)
  {
      var collection = db.collection(keyArray[key]);
      console.log(key + "  " + keyArray[key])
      collection.find({"IsPenalty" : "1" ,"PenaltyTeam" : "SEA"}).toArray(function(err,docs){
      console.log(docs[0].DefenseTeam + " " + docs.length)

        penaltyData.push(docs);
        if(key==keyArray.length-1){
            app.get('/data', function(req, res){
            var asJSON = JSON.stringify(penaltyData);
            res.send(asJSON)
        })

        }
      })
  }

}
//helper functions
function connecToMongo(){
  // Connect to the db
  MongoClient.connect("mongodb://localhost:27017/Seahawks", function(err, db) {
    if(err) throw err;
    for(key in pbpData){
          var collection = db.collection(key);
          collection.insert(pbpData[key], function(err, docs) {
          });
    }
  });
  db.close();

}
// Chatroom
//my own stuff
//Temp communication to front end for testing. 

//Data structure for NFL data
function nflData(){
  this.gameID
}
function readCSV(){
var stream = fs.createReadStream(__dirname + '/data/pbp-2014.csv');


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
          console.log(pbpData[2014121412])
     connecToMongo();
    });
}

function getKeys(){
  var badKey;
    MongoClient.connect("mongodb://localhost:27017/Seahawks", function(err, db) {
    db.collectionNames(function(err, items) {
      for(key in items){
          var tempName = items[key].name;
          if(tempName!="Seahawks.system.indexes")
          {
            items[key]=tempName.split(".")[1];
          }
          else{
            badKey = key;
          }
      }
      items.splice(badKey,1)
      keyArray = items.slice(0);
      querySeahawksPlays(db)
      });
        
    })
}