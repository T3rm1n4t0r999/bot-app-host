// models/File.js
const { sequelize } = require('../database/db');
const { DataTypes } = require('sequelize');

const File = sequelize.define('File', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    // Уникальный идентификатор файла в Telegram
    fileId: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    // Тип файла (photo, video, document, audio, etc.)
    fileType: {
        type: DataTypes.ENUM('photo', 'video', 'document', 'audio', 'voice', 'sticker', 'animation'),
        allowNull: false
    },
    // MIME тип файла
    mimeType: {
        type: DataTypes.STRING,
        allowNull: true
    },
    // Оригинальное имя файла
    fileName: {
        type: DataTypes.STRING,
        allowNull: true
    },
    // Размер файла в байтах
    fileSize: {
        type: DataTypes.BIGINT,
        allowNull: true
    },
    // Порядок файла в списке (для сортировки)
    order: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    // ID сущности, к которой привязан файл
    attachableId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    // Тип сущности, к которой привязан файл
    attachableType: {
        type: DataTypes.STRING,
        allowNull: false
    },
    // Дополнительная информация о файле (JSON)
    fileInfo: {
        type: DataTypes.JSONB,
        allowNull: true
    },
    // Описание/подпись к файлу
    caption: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    created_at: {type: DataTypes.DATE, allowNull: false, defaultValue: new Date()},
    updated_at: {type: DataTypes.DATE, allowNull: false, defaultValue: new Date()},
}, {
    tableName: 'files',
    timestamps: false,
    indexes: [
        {
            fields: ['attachableType', 'attachableId']
        },
        {
            fields: ['fileId']
        },
        {
            fields: ['attachableType', 'attachableId', 'order']
        }
    ]
});

module.exports = File;