'use strict';

module.exports = function(sequelize, Datatypes){
	var Permission = sequelize.define('Permission',{
		resource: Datatypes.STRING,
		create: { type: Datatypes.BOOLEAN, defaultValue: false },
		retrieve: { type: Datatypes.BOOLEAN, defaultValue: false },
		modify: { type: Datatypes.BOOLEAN, defaultValue: false },
		remove: { type: Datatypes.BOOLEAN, defaultValue: false }
	},{
		classMethods: {
			associate: function(models){
				Permission.belongsToMany( models.Role, { through: "role_permission" ,as: {singular: 'Role', plural: 'Roles'}});
			}
		}
	});
	return Permission
}