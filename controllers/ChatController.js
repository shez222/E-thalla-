const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const Chat = require('../models/chat');

const getAllChats = async (req, res) => {
    const { userId } = req.params;

    try {
        // Find all chats where the userId is part of participants
        const chats = await Chat.findAll({
            where: {
                participants: {
                    [Op.contains]: [userId],
                },
            },
            order: [['updatedAt', 'DESC']], // Order by most recently updated
        });

        res.json(chats);
    } catch (error) {
        console.error('Error fetching chats:', error);
        res.status(500).json({ error: 'Failed to fetch chats' });
    }
};
const getChat = async (req, res) => {

// router.get('/:chatId', async (req, res) => {
    try {
        const messages = await Message.findAll({
            where: { chatId: req.params.chatId, deleted: false },
            order: [['createdAt', 'ASC']],
        });
        res.json(messages);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch messages' });
    }
};
const deleteMessage = async (req, res) => {

// router.delete('/:id', async (req, res) => {
    try {
        const message = await Message.findByPk(req.params.id);
        if (message) {
            message.deleted = true;
            await message.save();
            res.json({ success: true });
        } else {
            res.status(404).json({ error: 'Message not found' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete message' });
    }
};

module.exports = {getAllChats ,getChat, deleteMessage}

// module.exports = router;
