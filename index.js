// Setup basic express server
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('../..')(server);
var port = process.env.PORT || 3000;
var scraperjs = require('scraperjs');

server.listen(port, function () {
  console.log('Server listening at port %d', port);
});

// Routing
app.use(express.static(__dirname + '/public'));

// Chatroom
//my own stuff


app.get('/salaries', function(req, res){
      var namez = [];
      var positionz = [];
        scraperjs.StaticScraper.create('http://www.spotrac.com/nfl/seattle-seahawks/cash/')
            .scrape(function($) {
                return $("#teamTable tbody .player a").map(function() {
                    return $(this).text();
                }).get();
            }, function(names) {
              //console.log("whaddup")
              namez = names;
            })
            .scrape(function($) {
                return $("#teamTable tbody .player").map(function() {
                    return $(this).next('td').children("span").text();
                }).get();
            }, function(position) {
              //console.log("whaddup")
              positionz = position;
            })
            .scrape(function($) {
                return $(" .figure").map(function() {
                    return $(this).text();
                }).get();
            }, function(news) {
              //console.log(news)
              //console.log("whaddup")
              var theJSON = '{ "Players" : [';
              for (var i = 0; i < namez.length-1; i++) {
              namez[i] = namez[i].replace(/'/gi,"");
              theJSON = theJSON + '{"name": "' + namez[i] + '" ,"salary" : "' + news[i+1] + '" , "position": "'+ positionz[i]+'"} ,'
              }
              theJSON = theJSON + '{"name": "' + namez[namez.length] + '","salary" : "' + news[namez.length] + '" , "position": "'+ positionz[namez.length]+'"}]}'
              var asJSON = JSON.stringify(theJSON);
              res.send(asJSON)
            })
  });
app.get('/teamStats', function(req, res){
  function teamObject(name, win, loss, tie, percentage,pf,pa){
    this.name = name;
    this.win = win;
    this.loss = loss;
    this.tie = tie;
    this.percentage = percentage;
    this.pf = pf;
    this.pa = pa;
  }
  function returnJSON()
  {
    res.send(JSON.stringify(totalData))
  }
  var teamName =  [];
  var wins = [];
  var loses = [];
  var ties = [];
  var pct = [];
  var pf = [];
  var pa = [];
  var totalData = [];
  var y = 2012;
  function scrapeThat(){
        scraperjs.StaticScraper.create('http://www.nfl.com/standings?category=league&season='+y+'-REG&split=Overall')
            .scrape(function($) {
                return $(".tbdy1").map(function() {
                    teamName = $(this).find("a").text();
                    teamName = teamName.replace("\n\t\t\t\t\t\t","")
                    teamName = teamName.replace("\n\t\t\t\t\t\t","") //serialize stupid nfl.com bs
                    return teamName;
                }).get();
            }, function(names) {
              teamName = names;
              //res.send(names)
            })
            .scrape(function($) {
                return $(".tbdy1").map(function() {
                    var temp = $(this).find(">:first-child").next("td").next("td").next("td").text();
                    return temp;
                }).get();
            }, function(result) {
                wins = result;
            })
            .scrape(function($) {
                return $(".tbdy1").map(function() {
                    var temp = $(this).find(">:first-child").next("td").next("td").next("td").next("td").text();
                    return temp;
                }).get();
            }, function(result) {
                loses = result;
            })
            .scrape(function($) {
                return $(".tbdy1").map(function() {
                    var temp = $(this).find(">:first-child").next("td").next("td").next("td").next("td").next("td").text();
                    return temp;
                }).get();
            }, function(result) {
                ties = result;
            })
            .scrape(function($) {
                return $(".tbdy1").map(function() {
                    var temp = $(this).find(">:first-child").next("td").next("td").next("td").next("td").next("td").next("td").text();
                    return temp;
                }).get();
            }, function(result) {
                pct = result;
            })
            .scrape(function($) {
                return $(".tbdy1").map(function() {
                    var temp = $(this).find(">:first-child").next("td").next("td").next("td").next("td").next("td").next("td").next("td").text();
                    return temp;
                }).get();
            }, function(result) {
                pf = result;
            })
             .scrape(function($) {
                return $(".tbdy1").map(function() {
                    var temp = $(this).find(">:first-child").next("td").next("td").next("td").next("td").next("td").next("td").next("td").next("td").text();
                    return temp;
                }).get();
            }, function(result) {
            pa = result;
            var result = [];
            result.push(y);
            for(i=0;i<teamName.length;i++)
            {
              var temp = new teamObject(teamName[i],wins[i],loses[i],ties[i],pct[i],pf[i],pa[i])
              result.push(temp);
            }
            totalData
            totalData.push(result);
            console.log(y)
            if(y==2013)
            returnJSON();
            else
            {
              y++;
              scrapeThat();

            }
        })
  }
  scrapeThat();
})