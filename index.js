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
var thirdDownCache = [];
var i = 0;
//readCSV();
getKeys();

//Function that gets success rate of third down pass/run plays
function querySeahawksPlaysThirdDown(db){
  console.log("hi")
  var rushCount = 0;
  var passCount = 0;
  var convertCountRush = 0;
  var convertCountPass = 0;
  var sackCount = 0;
  var playCount = 0;
var gameCount = 0;
  //for each game.
  for(game in keyArray)
  {
      var collection = db.collection(keyArray[game]);
      collection.find({"Down" : "3"}).toArray(function(err,plays){
        gameCount++;
        playCount += plays.length;
        for(key in plays){

            //Logic for Rush
            if(plays[key].IsRush=="1"){
                  if(plays[key].ToGo<=plays[key].Yards){
                    convertCountRush++;
                  }
                  rushCount++;
            }
            //logic for Pass
            else{
              if(plays[key].IsPass=="1"){
                  //if yards gained is greater than to go. successful conversion
                  if(plays[key].ToGo<=plays[key].Yards){
                    convertCountPass++;
                  }
                  passCount++;
              }
              //ERROR CHECKING: 
              //Case for penalties/sacks/fumbles.. 
              if(plays[key].IsPass=="0"){
                  //could do recursive check here for if multiple plays after penalty...add later. 
                  //Penalty check next play for count. 
                  if(plays[key].IsNoPlay=="1"){
                      //Check first down?
                      if(plays[key+1]!=undefined) //means the game was alreadyd over. 
                      {
                        if(plays[key+1].ToGo<=plays[key+1].Yards){
                          convertCountRush++;
                        }
                      }
                  }
                  else if((plays[key].IsSack=="1")||(plays[key].IsFumble=="1")){
                      //sackCount++;
                  }
                  else{
                      //this is where kneel downs happen....but we dont care abotu that. 
                  }
              }


            }

        }
        //due to asynchronous nature of code must check for end case down here...
        console.log(plays[0].GameId)
       // console.log(keyArray[keyArray.length-1])
        if(gameCount==15)
        {
            console.log(playCount);
            console.log(convertCountRush)
            console.log(convertCountPass)
            console.log(passCount)
            console.log(rushCount)
        }

      })
      //Iterate through each down and keep track of play selection. 
  }
}
function checkIfFirstDownPass(plays){

}
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
  MongoClient.connect("mongodb://chrischris292:xbox360@ds029541.mongolab.com:29541/nfl", function(err, db) {
    if(err) throw err;
    for(key in pbpData){
          var collection = db.collection("Seahawks");
          collection.insert(pbpData[key], function(err, plays) {
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
    MongoClient.connect("mongodb://chrischris292:xbox360@ds029541.mongolab.com:29541/nfl", function(err, db) {
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
      //querySeahawksPlays(db);
      querySeahawksPlaysThirdDown(db)
    })
  })
}
