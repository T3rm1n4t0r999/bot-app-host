// models/studentHomework.js
const { sequelize } = require('../database/db');
const { DataTypes } = require('sequelize');

const StudentHomework = sequelize.define('StudentHomework', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    homeworkId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'homeworks',
            key: 'id'
        }
    },
    studentId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'students',
            key: 'id'
        }
    }
}, {
    tableName: 'student_homework',
    timestamps: true,
    underscored: true,
});

module.exports = StudentHomework;
