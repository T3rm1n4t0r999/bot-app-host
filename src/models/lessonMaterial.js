// models/LessonMaterial.js
const { sequelize } = require('../database/db');
const { DataTypes } = require('sequelize');

const LessonMaterial = sequelize.define('LessonMaterial', {
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
    content: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    order: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    materialType: {
        type: DataTypes.ENUM('theory', 'example', 'reference', 'video_lesson', 'article'),
        defaultValue: 'theory'
    },
    lessonId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'lessons',
            key: 'id'
        }
    }
}, {
    tableName: 'lesson_materials',
    timestamps: true,
    underscored: true,
});

module.exports = LessonMaterial;