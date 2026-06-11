// models/Invitation.js
const { sequelize } = require('../database/db');
const { DataTypes } = require('sequelize');

const Invitation = sequelize.define('Invitation', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    organization_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'organizations',
            key: 'id'
        }
    },
    sender_id: {
        type: DataTypes.INTEGER,  // Изменено со STRING на INTEGER
        allowNull: false,
        validate: {
            notEmpty: true
        }
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            isEmail: true,
            notEmpty: true
        }
    },
    type: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: 'member'
    },
    status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'pending'
    },
    token: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            notEmpty: true
        }
    },
    limited: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: false
    },
    accepted_at: {
        type: DataTypes.DATE,
        allowNull: true
    },
    expires_at: {
        type: DataTypes.DATE,
        allowNull: true
    },
    group_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    }
}, {
    tableName: 'invitations',
    timestamps: true,
    underscored: true,
});

module.exports = Invitation;