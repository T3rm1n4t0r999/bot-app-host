const {sequelize} = require('../database/db');
const {DataTypes} = require('sequelize');


const Module = sequelize.define('Module', {
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
    courseId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'courses',
            key: 'id'
        }
    }
}, {
    tableName: 'modules',
    underscored: true,
    timestamps: true
});


module.exports = Module;