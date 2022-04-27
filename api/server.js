// import { config } from 'dotenv';
// require('dotenv').config()
const DB_URI = 'mongodb://localhost:27017/';
const mongo = require('mongodb');
const bodyParser = require('body-parser');
var MongoClient = require('mongodb').MongoClient;
var dbName = 'crawler';
var baseResponse = { status: 1, msg: '', data: null }
var express = require('express');
var app = express();
var fs = require("fs");
var cors = require('cors');
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.raw());

app.get('/crawl/applications', function (req, res) {
    return getApplications(DB_URI, res);

})
app.get('/crawl/application/:appId', function (req, res) {
    const appId = req.params.appId;
    fs.readFile(__dirname + "/" + "mock-data.json", 'utf8', function (err, data) {

        res.end(data);
    });
})
app.post('/crawl/applications', function (req, res) {
    const appId = req.params.appId;
    console.log('Got body:', req.body);
    registerApp(DB_URI, req.body);
    res.send(baseResponse);
})
var server = app.listen(8081, function () {
    console.log(DB_URI);
    //registerApp(DB_URI);
    var host = server.address().address
    var port = server.address().port
    console.log("Example app listening at http://%s:%s", host, port)
})

function registerApp(uri, app) {
    MongoClient.connect(uri, function (err, db) {
        if (err) throw err;
        var dbo = db.db(dbName);
        dbo.collection("applications").insertOne(app, function (err, res) {
            if (err) throw err;
            console.log("1 document inserted");
            db.close();
        });
    });
}
function getApplications(uri, res) {
    MongoClient.connect(uri, function (err, db) {
        if (err) throw err;
        var dbo = db.db(dbName);
        dbo.collection("applications").find({}).toArray(function (err, result) {
            if (err) {
                return res.json({ msg: 'mongo find error' });
            }
            db.close();
            return res.json(result);;
        });
    });
}

/**unused */

async function connectToCluster(uri) {
    MongoClient.connect(uri, function (err, db) {
        if (err) throw err;
        var dbo = db.db(dbName);
        dbo.createCollection("applications", function (err, res) {
            if (err) throw err;
            console.log("Collection created!");
            db.close();
        });
    });
}