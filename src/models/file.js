// models/File.js
const { sequelize } = require('../database/db');
const { DataTypes } = require('sequelize');

const File = sequelize.define('File', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'Файл'
    },
    path: {
        type: DataTypes.STRING,
        allowNull: false
    },
    disk: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'public'
    },
    size: {
        type: DataTypes.BIGINT,
        allowNull: true
    },
    mime_type: {
        type: DataTypes.STRING,
        allowNull: true
    },
    extension: {
        type: DataTypes.STRING,
        allowNull: true
    },
    fileable_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    fileable_type: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, {
    tableName: 'files',
    timestamps: true,
    underscored: true,
    indexes: [
        {
            fields: ['fileable_type', 'fileable_id']
        },
        {
            fields: ['fileable_type', 'fileable_id']
        },
        {
            fields: ['mime_type']
        }
    ]
});

module.exports = File;