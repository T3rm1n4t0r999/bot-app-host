// models/StudentProgress.js
const { sequelize } = require('../database/db');
const { DataTypes } = require('sequelize');

const StudentProgress = sequelize.define('StudentProgress', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    answers: {
        type: DataTypes.JSONB,
        allowNull: true
    },
    attachedFiles: {
        type: DataTypes.JSONB,
        allowNull: true
    },
    points: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    studentId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'students',
            key: 'id'
        }
    },
    taskId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'lessonTask',
            key: 'id'
        }
    }
}, {
    tableName: 'student_progress',
    timestamps: false,
    underscored: true,
    indexes: [
        {
            fields: ['student_id', 'task_id'],
            unique: true
        }
    ]
});

module.exports = StudentProgress;