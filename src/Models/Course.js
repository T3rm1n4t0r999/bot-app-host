const {sequelize} = require('../Database/db');
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
    },
    organization_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    order: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    auto_assign: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
}, {
    underscored: true,
    timestamps: true
});


module.exports = Course;