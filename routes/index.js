var models  = require('../models');
var express = require('express');
var router  = express.Router();

router.get('/', function(req, res) {
  models.User.findAll({
  }).then(function(users) {
    res.render('index', {
      title: 'Administration',
      users: users
    });
  });
});

router.get('/dashboard', function(req, res){
	res.render('dash',{
		title: 'Dashboard'
	});
});

module.exports = router;
