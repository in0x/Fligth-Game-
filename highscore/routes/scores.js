var express = require('express');
var router = express.Router();
var mongodb = require('mongodb');
var monk = require('monk');
var credentials = require('../credentials');
var db = monk(credentials.uri);
var cors = require('cors');
 
// GET scores, sorted by time
router.get('/', cors(), function(req, res) {
  console.log('GET scores');
  // Get the database object we attached to the request
  //var db = req.db;
  // Get the collection
  var collection = db.get('scores');
  // Find all entries, sort by score (ascending)
  collection.find({}, { sort: { time: 1 } }, function (err, docs) {
    if (err) {
        // Handle error
        console.error('Failed to get scores', err);
        res.status(500).send('Failed to get scores');
    } else {
        // Respond with the JSON object
        res.json(docs);
    }
  });
});
 
module.exports = router;
