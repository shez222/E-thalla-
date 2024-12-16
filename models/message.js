const { DataTypes } = require('sequelize');
const sequelize = require('../config/database'); // Replace with your DB config file

const Message = sequelize.define('Message', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    chatId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Chats',
            key: 'id',
        },
    },
    senderId: {
        type: DataTypes.STRING,
        allowNull: false,
    },receiverId: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    type: {
        type: DataTypes.ENUM('text', 'voice', 'video'),
        allowNull: false,
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    deleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
}, {
    timestamps: true,
});

module.exports = Message;
