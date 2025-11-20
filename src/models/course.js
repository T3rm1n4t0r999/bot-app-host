const {sequelize} = require('../database/db');
const {DataTypes} = require('sequelize');


const Course = sequelize.define('Course', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: true
        }
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    underscored: true,
    timestamps: true
});


module.exports = Course;