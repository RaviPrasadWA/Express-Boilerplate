'use strict';

module.exports = function(sequelize, Datatypes){
	var Role = sequelize.define('Role',{
		name: Datatypes.STRING
	},{
		classMethods: {
			associate: function(models){
				Role.belongsToMany( models.Permission, { through: "role_permission" ,as: {singular: 'Permission', plural: 'Permissions'} });
			}
		}
	});
	return Role;
}