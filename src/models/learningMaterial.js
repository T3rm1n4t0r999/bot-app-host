// models/LearningMaterial.js
const { sequelize } = require('../database/db');
const { DataTypes } = require('sequelize');

const LearningMaterial = sequelize.define('LearningMaterial', {
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
    // Порядок материалов внутри урока
    order: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    // Тип материала (theory, example, reference, etc.)
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
    tableName: 'learning_materials',
    timestamps: true
});

module.exports = LearningMaterial;