'use strict';

module.exports = function(sequelize, Datatypes){
	var Role = sequelize.define('Role',{
		name: Datatypes.STRING
	},{
		classMethods: {
			associate: function(models){
				Role.hasMany( models.Permission, { as: "Permission" });
			}
		}
	});
	return Role;
}