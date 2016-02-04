var models  = require('../models');
var express = require('express');
var router  = express.Router();
var client = require('redis').createClient(6379, '127.0.0.1', {no_ready_check: true});
var acl = require('acl');
var async = require('async');
var Lazy = require('lazy');
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
		models.Permission.findAll({}).then(function(permissions){
			var resource_display = {};
			var iterate = 0;
			roles.forEach(function(role){
				resource_display[role.name] = [];
				var q = async.queue(function (task, callback) {
					resource_display[role.name].push(task.resource);
					callback();
				}, 5);

				q.drain = function() {
					console.log(roles.length ,iterate)
					if(roles.length == iterate){
						console.log(resource_display)
						res.render('admin_role',{
							title: 'Role Administration',
							name: 'Roles',
							roles: roles,
							permissions: permissions,
							resource_display: resource_display
						});
					}
				}
				role.getPermissions().then(function(perm){
					perm.forEach(function(permissionData, index, callback){
						q.push(permissionData.dataValues, function(){
							
						});
					});
				});
				iterate++;
			});
		});
	});
})

router.post('/roles/create', function(req, res){
	if( req.user ){
		if( Object.keys(req.body).length > 0 ){ a
			req.body = JSON.parse(JSON.stringify(req.body));
			var name = req.body['name'];
			var permissions = [];
			delete req.body['name'];


			models.Role.findOne({ where:{name: name} }).then(function(role){
				if(role){
					res.statusCode = 409;
					res.send("role with this name exists .....");
				}else{
					models.Role.create({ name: name}).then(function(role){
						for(var key in req.body){
							models.Permission.findOne({ where: {id : req.body[key]} }).then(function(permission){
								role.setPermissions(permission).then(function(){

									});
							});
						}
						res.redirect('/admin');
					});
				}
			});
		}
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
		if( Object.keys(req.body).length > 0 ){
			models.Permission.findOne({ where: {resource: req.body['resource']} }).then(function(permission) {
				if( permission == null ){
					models.Permission.create({
						resource: req.body['resource'],
						create: req.body.hasOwnProperty('create'),
						retrieve: req.body.hasOwnProperty('retrieve'),
						modify: req.body.hasOwnProperty('update'),
						remove: req.body.hasOwnProperty('delete')
					});
					res.redirect('/admin/roles/permission');
				}else{
					res.statusCode = 409;
					res.send('permission with this name already exists ...');
				}
			});
		}
	}
})

router.get('/:permission_id/roles/permission/destroy', function(req, res) {
	models.Permission.destroy({
		where: { id: req.params.permission_id }}).then(function() {
			res.redirect('/admin/roles/permission');
		});
	});

router.post('/roles/permission/edit', function(req, res) {
	if( req.user ){
		req.body = JSON.parse(JSON.stringify(req.body));
		var create = req.body.hasOwnProperty('create');
		var retrieve = req.body.hasOwnProperty('retrieve');
		var modify = req.body.hasOwnProperty('update');
		var remove = req.body.hasOwnProperty('delete');
		models.Permission.findOne({ where: {id: req.body['id'] }}).then(function(permission){
			permission.update({
				create: create,
				retrieve: retrieve,
				modify: modify,
				remove: remove
			}).then(function(){
				res.redirect('/admin/roles/permission');
			});
		});
	}
});

module.exports = router;