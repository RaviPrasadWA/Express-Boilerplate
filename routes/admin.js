var models  = require('../models');
var express = require('express');
var router  = express.Router();

router.get('/', function(req, res) {
  models.User.findAll({
  }).then(function(users) {
    res.render('admin_user', {
      title: 'User Administration',
      users: users
    });
  });
});

module.exports = router;