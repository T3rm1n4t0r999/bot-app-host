// models/Lesson.js
const { sequelize } = require('../database/db');
const { DataTypes } = require('sequelize');

const Lesson = sequelize.define('Lesson', {
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
    moduleId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'modules',
            key: 'id'
        }
    }
}, {
    tableName: 'lessons',
    timestamps: true,
    underscored: true,
});

module.exports = Lesson;