var express = require('express');
var router = express.Router();
var mongodb = require('mongodb');
var monk = require('monk');
var credentials = require('../credentials');
var db = monk(credentials.uri);
var cors = require('cors');

router.get("/", cors(), function(req, res) {
    console.log("GET top scores");
    // Read the request parameter
    var num = req.params.number;
    console.log(num);
    var collection = db.get("scores");
    // Get all scores, but limit the number of results
    collection.find({}, { limit: num, sort: { time : 1 } }, function(err, docs) {
        if (err) {
            console.error("Failed to get scores", err);
            res.status(500).send("Failed to get scores");
        } else {
            res.json(docs);
        }
    });
});

module.exports = router;