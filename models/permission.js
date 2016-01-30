'use strict';

module.exports = function(sequelize, Datatypes){
	var Permission = sequelize.define('Permission',{
		name: Datatypes.STRING
	});
	return Permission
}