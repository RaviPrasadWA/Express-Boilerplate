var models  = require('../models');
var express = require('express');
var router  = express.Router();
var client = require('redis').createClient(6379, '127.0.0.1', {no_ready_check: true});
var acl = require('acl');
acl = new acl(new acl.redisBackend(client, "acl_"));

router.get('/', function(req, res) {
	if( req.user ){
		acl.hasRole(req.user.id, 'superuser', function(err, hasrole){
			if( hasrole ){
				models.User.findAll({}).then(function(users) {
					res.render('admin_user', {
						title: 'User Administration',
						users: users
					});
				});
			}else{
				res.send("dont have permission ...");
			}
		})
	}else{
		models.User.findAll({}).then(function(users) {
			res.render('admin_user', {
				title: 'User Administration',
				users: []
			});
		});
	}
});

module.exports = router;