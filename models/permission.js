'use strict';

module.exports = function(sequelize, Datatypes){
	var Permission = sequelize.define('Permission',{
		resource: Datatypes.STRING,
		create: { type: Datatypes.BOOLEAN, defaultValue: false },
		retrieve: { type: Datatypes.BOOLEAN, defaultValue: false },
		modify: { type: Datatypes.BOOLEAN, defaultValue: false },
		remove: { type: Datatypes.BOOLEAN, defaultValue: false }
	});
	return Permission
}