// models/StudentProgress.js
const { sequelize } = require('../database/db');
const { DataTypes } = require('sequelize');

const StudentProgress = sequelize.define('StudentProgress', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    // Статус выполнения задания
    status: {
        type: DataTypes.ENUM('not_started', 'in_progress', 'completed', 'graded'),
        defaultValue: 'not_started'
    },
    // Прогресс в процентах
    progress: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        validate: {
            min: 0,
            max: 100
        }
    },
    // Ответы студента (JSON структура)
    answers: {
        type: DataTypes.JSONB,
        allowNull: true
    },
    // Прикрепленные файлы студента
    attachedFiles: {
        type: DataTypes.JSONB,
        allowNull: true
    },
    // Дата начала выполнения
    startedAt: {
        type: DataTypes.DATE,
        allowNull: true
    },
    // Дата завершения
    completedAt: {
        type: DataTypes.DATE,
        allowNull: true
    },
    // Оценка
    grade: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    // Комментарии преподавателя
    teacherFeedback: {
        type: DataTypes.TEXT,
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
    timestamps: true,
    indexes: [
        {
            fields: ['studentId', 'taskId'],
            unique: true
        }
    ]
});

module.exports = StudentProgress;