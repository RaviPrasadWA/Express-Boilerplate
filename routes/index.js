var models  = require('../models');
var express = require('express');
var router  = express.Router();

router.get('/', function(req, res) {
  models.User.findAll({
    include: [ models.Property ]
  }).then(function(users) {
    res.render('index', {
      title: 'Reporting',
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
