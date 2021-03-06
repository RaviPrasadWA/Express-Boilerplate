var models  = require('../models');
var express = require('express');
var config = require('../config/config.json');
var router  = express.Router();
var client = require('redis').createClient(6379, '127.0.0.1', {no_ready_check: true});
var acl = require('acl');
var async = require('async');
acl = new acl(new acl.redisBackend(client, "acl_"));

var BASE_URL = config.development.base_url;

router.get('/', function(req, res) {
	if( req.user ){
		
		acl.hasRole(req.user.id, 'superuser', function(err, hasrole){
			if( hasrole ){
				models.User.findAll({}).then(function(users) {
					res.render('admin_user', {
						title: 'User Admin',
						name: 'Users',
						users: users,
						base_url: BASE_URL
					});
				});
			}else{
				models.User.findAll({}).then(function(users) {
					res.render('admin_user', {
						title: 'User Admin',
						name: 'Users',
						users: users,
						base_url: BASE_URL
					});
				});
				//res.send("dont have permission ..."); // -> TODO: ACTIVATE THIS CODE AND REMOVE THE ABOVE ONE
			}
		})
	}else{
		models.User.findAll({}).then(function(users) {
			res.render('admin_user', {
				title: 'User Admin',
				users: [],
				base_url: BASE_URL
			});
		});
	}
});

router.get('/roles', function(req, res){

	models.Role.findAll({}).then(function(roles){

		if(roles.length == 0){
			models.Permission.findAll({}).then(function(permissions){
				res.render('admin_role',{
					title: 'Role Admin',
					name: 'Roles',
					roles: roles,
					permissions: permissions,
					resource_display: [],
					base_url: BASE_URL
				});
			});
		}

		models.Permission.findAll({}).then(function(permissions){
			var resource_display = {};
			var iterate = 0;

			var outer_async = async.queue(function(data, outer_callback, sz){
				var label = data.dataValues.name;
				var toSend = {};
				toSend[label] = null;

				var inner_async = async.queue(function(inner_data, inner_callback, sz){
					resource_display[data.dataValues.name] = [];
					inner_data[Object.keys(inner_data)[0]].forEach(function(entity){
						resource_display[Object.keys(inner_data)[0]].push(entity.resource);
					})
					inner_callback();
				}, 5);

				inner_async.drain = function(){
					if(Object.keys(resource_display).length === roles.length){
						res.render('admin_role',{
							title: 'Role Admin',
							name: 'Roles',
							roles: roles,
							permissions: permissions,
							resource_display: resource_display,
							base_url: BASE_URL
						});
					}
				}

				
				data.getPermissions().then(function(permission){
					toSend[label] = permission;
					inner_async.push(toSend, function(){}, 2);
				})
				outer_callback();
			}, 5);

			outer_async.drain = function(){
			}

			outer_async.push( roles, function(){}, 2);
		});
	});
})

router.post('/roles/create', function(req, res){
	if( req.user ){
		if( Object.keys(req.body).length > 0 ){
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

router.get('/:role_name/roles/destroy', function(req, res) {
	console.log( req.params );
	models.Role.destroy( { where: { name: req.params.role_name } }).then(function(role){
		res.send('deleted successfully');
	});
});

router.get('/roles/permission', function(req, res){
	models.Permission.findAll({}).then(function(permissions){
		res.render('admin_permission',{
			title: 'Permissions',
			name: 'Permission',
			permissions: permissions,
			base_url: BASE_URL
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
			res.send('deleted successfully ....');
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

router.get('/acl', function(req, res) {
	if( req.user ){
		res.send("acl comming soon .....");
	}
});

module.exports = router;