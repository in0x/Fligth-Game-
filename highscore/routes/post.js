var express = require('express');
var router = express.Router();
var mongodb = require('mongodb');
var monk = require('monk');
var credentials = require('../credentials');
var db = monk(credentials.uri);

// POST a score
router.post("/", function(req, res) {
    console.log("POST score");
    var name = req.body.name;
    var score = Number(req.body.score);
    if (!(name && score)) {
        console.error("Data formatting error");
        res.status(400).send("Data formatting error");
        return;
    }
    var collection = db.get("scores");
    collection.insert({
        "name": name,
        "score": score
    }, function(err, doc) {
        if (err) {
            console.error("DB write failed", err);
            res.status(500).send("DB write failed");
        } else {
            // Return the added score
            res.json(doc);
        }
    });
});

module.exports = router;