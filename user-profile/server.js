const express = require('express');
const path = require('path');
const fs = require('fs');
const MongoClient = require('mongodb').MongoClient;
const bodyParser = require('body-parser');
const app = express();

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.get('/profile-picture', function (req, res) {
  let img = fs.readFileSync(path.join(__dirname, "images/profile-pic.jpg"));
  res.writeHead(200, {'Content-Type': 'image/jpg' });
  res.end(img, 'binary');
});

// MongoDB connection URL
const mongoUrlLocal = "mongodb://admin:password@localhost:27017";
const databaseName = "user-account";

app.post('/update-profile', function (req, res) {
  let userObj = req.body;

  MongoClient.connect(mongoUrlLocal, function (err, client) {
    if (err) throw err;

    let db = client.db(databaseName);
    userObj['userid'] = 1;

    let myquery = { userid: 1 };
    let newvalues = { $set: userObj };

    db.collection("users").updateOne(myquery, newvalues, {upsert: true}, function(err, result) {
      if (err) throw err;
      console.log("Profile updated successfully");
      client.close();
      // Send response
      res.send(result);
    });
  });
});

app.get('/get-profile', function (req, res) {
  // Connect to the db
  MongoClient.connect(mongoUrlLocal, function (err, client) {
    if (err) throw err;

    let db = client.db(databaseName);
    let myquery = { userid: 1 };

    db.collection("users").findOne(myquery, function (err, result) {
      if (err) throw err;
      client.close();
      // Send response
      res.send(result ? result : {});
    });
  });
});

app.listen(3001, function () {
  console.log("app listening on port 3001!");
});
