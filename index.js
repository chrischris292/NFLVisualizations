/**
  javascript's single threaded asynchronous BS is super annoying. 
  I do not understand why there is no multi threaded support instead of
  pseudo multi threaded crap known as asynchrony. 

  Path: getKeys() -> querySeahawksPlays() -> 

  getKeys(): Sets up keyArray. Puts in Game IDs into key array. 
  querySeahawksPlays(): Counts the amount of runs and passes called by Seahawks. 
**/


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
var keyArray;
var i = 0;
//readCSV();
getKeys();


//Function that queries Seahawks Penalty Plays. 
function querySeahawksPlays(db){
  var downPlay = new Array(4);
  done  = false;
  for(i = 1;i<=4;i++)
  {
    downPlay[i] = new playTypeTuple();
  }
  //key represents each game. 
  //iterating for each game. 
  var asyncCounter = 0;
  var runCountr = 0;
  for(key in keyArray)
  {
    console.log(keyArray[key])
      var collection = db.collection(keyArray[key]);
      collection.find().toArray(function(err,docs){
        runCountr += docs.length
        for(playKey in docs){

          var down = docs[playKey].Down
          if(down!=0){

              if(docs[playKey].PlayType=="PASS")
              {
                  downPlay[down].passCount++;
              }
              else if(docs[playKey].PlayType=="RUSH")
              {
                   downPlay[down].runCount++;
              }
              else if(docs[playKey].PlayType=="SCRAMBLE")
              {
                 downPlay[down].runCount++;
              }
              else if(docs[playKey].PlayType=="QB KNEEL")
              {
                 downPlay[down].runCount++;
              }

          }
        }
        asyncCounter++
        //console.log(asyncCounter)
        if(asyncCounter==keyArray.length){

            app.get('/playCount', function(req, res){
            var asJSON = JSON.stringify(downPlay);
            res.send(asJSON)
            })
        console.log(runCountr)

            console.log("Reached End")
            console.log(downPlay)
        }
      })
      //Iterate through each down and keep track of play selection. 
  }
}
function playTypeTuple(){
  this.runCount = 0;
  this.passCount = 0;
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
      querySeahawksPlays(db);
        
    })
  })
}
