const { DataTypes } = require('sequelize');
const sequelize = require('../config/database'); // Replace with your DB config file

const Chat = sequelize.define('Chat', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    participants: {
        type: DataTypes.JSON, // Store an array of user IDs
        allowNull: false,
    },
}, {
    timestamps: true,
});

module.exports = Chat;