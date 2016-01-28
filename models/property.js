"use strict";

module.exports = function(sequelize, DataTypes) {
	var Property = sequelize.define("Property",{
		title: DataTypes.STRING
	},{
		classmethods: {
			associate: function( models ){
				Property.belongsTo( models.User ,{
					onDelete: "CASCADE",
					foreignKey: {
						allowNull: false
					}
				});
			}
		}
	})
	return Property;
};