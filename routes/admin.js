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
						name: 'Users',
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

router.get('/roles', function(req, res){
	models.Role.findAll({}).then(function(roles){
		res.render('admin_role',{
			title: 'Role Administration',
			name: 'Roles',
			roles: roles
		});
	});
})

router.post('/roles/create', function(req, res){
	if( req.user ){
		console.log( req.body );
		res.send("got data .....");
	}
})


router.get('/roles/permission', function(req, res){
	models.Permission.findAll({}).then(function(permissions){
		res.render('admin_permission',{
			title: 'Permission Admin',
			name: 'Permission',
			permissions: permissions
		});
	});
})

router.post('/roles/permission/create', function(req, res){
	if( req.user ){
		req.body = JSON.parse(JSON.stringify(req.body));
		var create = req.body.
		models.Permission.findOrCreate({ where: { resource: req.body['resource'] } }).spread(
			function(permission, created){
				permission.update({ create: req.body.hasOwnProperty('create'),
									retrieve: req.body.hasOwnProperty('retrieve'),
									modify: req.body.hasOwnProperty('update'),
									remove: req.body.hasOwnProperty('delete') 
								}, { fields: ['create', 'retrieve', 'modify', 'remove'] }).then(function(){
									res.redirect('/admin/roles/permission');
								});
			});
	}
})

router.get('/:permission_id/roles/permission/destroy', function(req, res) {
	models.Permission.destroy({
		where: { id: req.params.permission_id }}).then(function() {
			res.redirect('/admin/roles/permission');
		});
	});

module.exports = router;