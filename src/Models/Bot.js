// Models/Bot.js
const { sequelize } = require('../Database/db');
const { DataTypes } = require('sequelize');

const Bot = sequelize.define('Bot', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: true
        }
    },
    bot_url: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            isUrl: true,
            notEmpty: true
        }
    },
    token: {
        type: DataTypes.TEXT,
        allowNull: false,
        unique: true,
        validate: {
            notEmpty: true
        }
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false
    },
    organization_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
        references: {
            model: 'organizations',
            key: 'id'
        }
    }
}, {
    tableName: 'bots',
    timestamps: true,
    underscored: true,
});



module.exports = Bot ;