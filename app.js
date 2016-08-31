var express = require('express');
var session = require('express-session');
var cookieParser = require('cookie-parser');

var Twitter = require("node-twitter-api");

var twitter = new Twitter({
  consumerKey: process.env.CONSUMER_KEY,
  consumerSecret: process.env.CONSUMER_SECRET,
  callback: 'https://tweeter-login.herokuapp.com/callback'
});

var app = express();
var port = process.env.PORT || 5000;

app.use(cookieParser());
app.use(session({secret: 'unguessable', resave: true, saveUninitialized: true}));
app.use(express.static(__dirname + '/html'));

app.get('/', function(req, res) {
  console.log(req.query);
  console.log(req.session);
  req.session.saveState = {};
  req.session.saveState = req.query.state;
  res.render('index.html');
});

app.get('/session-test', function(req, res) {
  console.log(req.session);
  var ss = 'state ' + req.session.saveState;
  res.send(ss);
});

app.get('/request-token', function(req, res) {
  twitter.getRequestToken(function(err, requestToken, requestSecret) {
    if(err) {
      res.status(500).send(err);
    } else {
      //res.send({token: requestToken, secret: requestSecret});
      _state = req.query.state;
      _requestSecret = requestSecret;
      res.redirect("https://api.twitter.com/oauth/authenticate?oauth_token=" + requestToken);
    }
  });
});

app.get("/access-token", function(req, res) {
  var requestToken = req.query.oauth_token;
  var verifier = req.query.oauth_verifier;

  twitter.getAccessToken(requestToken, _requestSecret, verifier, function(err, accessToken, accessSecret) {
    if(err) {
      res.status(500).send(err);
    } else {
      res.send({token: accessToken, secret: accessSecret, state: _state});
    }
  });
});

app.listen(port);