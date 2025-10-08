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
    // Цели урока
    objectives: {
        type: DataTypes.JSONB,
        allowNull: true
    },
    // Предварительные требования
    prerequisites: {
        type: DataTypes.JSONB,
        allowNull: true
    },
    // Продолжительность урока (в минутах)
    duration: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    // Статус публикации (draft, published, archived)
    status: {
        type: DataTypes.ENUM('draft', 'published', 'archived'),
        defaultValue: 'draft'
    },
    // Статус выполнения (для конкретного студента)
    completionStatus: {
        type: DataTypes.ENUM('not_started', 'in_progress', 'completed'),
        defaultValue: 'not_started'
    },
    // Прогресс выполнения в процентах
    progress: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        validate: {
            min: 0,
            max: 100
        }
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
    timestamps: false
});

module.exports = Lesson;