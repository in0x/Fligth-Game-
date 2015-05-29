var express = require('express');
var router = express.Router();
var mongodb = require('mongodb');
var monk = require('monk');
var credentials = require('../credentials');
var db = monk(credentials.uri);
var cors = require('cors');
 
// GET scores
router.get('/', cors(), function(req, res) {
  console.log('GET scores');
  var collection = db.get('scores');
  // Find all entries, sort by score (ascending)
  collection.find({}, { sort: { score: 1 } }, function (err, docs) {
    if (err) {
        // Handle error
        console.error('Failed to get scores', err);
        res.status(500).send('Failed to get scores');
    } else {
        res.json(docs);
    }
  });
});
 
module.exports = router;
