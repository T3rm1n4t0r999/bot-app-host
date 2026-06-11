// Models/Organization.js
const { sequelize } = require('../Database/db');
const { DataTypes } = require('sequelize');

const OrganizationStatus = {
    PENDING_VERIFICATION: 'pending_verification',
    ACTIVE: 'active',
    SUSPENDED: 'suspended',
    DELETED: 'deleted'
};

const Organization = sequelize.define('Organization', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            notEmpty: true
        }
    },
    owner_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    email: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
            isEmail: true
        }
    },
    status: {
        type: DataTypes.ENUM(...Object.values(OrganizationStatus)),
        defaultValue: OrganizationStatus.PENDING_VERIFICATION,
        allowNull: false
    },
    settings: {
        type: DataTypes.JSON,
        allowNull: true
    },
    plan: {
        type: DataTypes.STRING,
        allowNull: true
    },
    email_verification_token: {
        type: DataTypes.STRING,
        allowNull: true
    },
    email_verified_at: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    tableName: 'organizations',
    timestamps: true,
    underscored: true,
    indexes: [
        {
            fields: ['email_verification_token']
        },
        {
            fields: ['status']
        },
        {
            fields: ['owner_id']
        }
    ]
});


module.exports = Organization;