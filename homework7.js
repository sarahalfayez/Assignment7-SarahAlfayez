// Client-side code
/* jshint browser: true, jquery: true, curly: true, eqeqeq: true, forin: true, immed: true, indent: 4, latedef: true, newcap: true, nonew: true, quotmark: double, undef: true, unused: true, strict: true, trailing: true */
// Server-side code
/* jshint node: true, curly: true, eqeqeq: true, forin: true, immed: true, indent: 4, latedef: true, newcap: true, nonew: true, quotmark: double, undef: true, unused: true, strict: true, trailing: true */
"use strict";
var express = require("express"),
    http = require("http"),
    bodyParser = require("body-parser"),
    mongoDB = require("mongodb"),
    MongoClient = mongoDB.MongoClient,
    app = express();


http.createServer(app).listen(3000);
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(bodyParser.json());

var url = "mongodb://localhost/hw7";
var db, pathname;

MongoClient.connect(url, function(err, database) {
    if (err) {
        console.log("Unable to connect to the mongoDB server. Error:", err);
    } else {
        console.log("successfully connected to the database");
        db = database;

    }
});
//GET links
app.get("/links", function(req, res) {
    console.log("get /links");
    db.collection("links").find({}).toArray(function(err, doc) {
        if (err) {
            console.log("Unable to get the links. Error:", err);
        } else {
            res.json(doc);
        }
    });

});
//POST /links
app.post("/links", function(req, res) {
    var Title = req.body.title;
    var Links = req.body.link;
    var Clicks = 0;
    if (!(req.body.title || req.body.link)) {
        console.log("Invalid user input", "Must provide a title or link.", 400);
    }
    db.collection("links").insert({
        title: Title,
        link: Links,
        clicks: Clicks
    }, function(err, doc) {
        if (err) {
            console.log("Failed to create new links. Error:", err);
        } else {
            res.status(201).json(doc.ops[0]);
            console.log(Title + "  link added");
        }
    });
});
// GET /click/:title
app.get("/click/:title", function(req, res) {
    console.log(req.originalUrl);
    var pathArray = req.originalUrl.split("/");
    var path = pathArray[2];
    console.log(path);
    db.collection("links").findOneAndUpdate({
        "title": path
    }, {
        $inc: {
            "clicks": 1
        }
    }, {
        returnOriginal: false,
        upsert: true
    }, function(err, doc) {
        if (err) {
            console.log("Failed to get link. Error:", err);
        } else {
            console.log("increment success");
            db.collection("links").distinct("link", {
                "title": path
            }).then(function(link) {
                console.log(link);
                res.writeHead(302, {
                    "Location": link
                });

                res.end();
            });
        }
    });
});
