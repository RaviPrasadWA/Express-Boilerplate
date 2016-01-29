var models  = require('../models');
var express = require('express');
var router  = express.Router();

router.get('/', function(req, res) {
  res.send("First Express App .....");
});


module.exports = router;
