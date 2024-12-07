const express = require('express');
const chatController = require('../controllers/ChatController');
const router = express.Router();
const multer = require('multer');

// Get all chats
router.get('/chats/', chatController.getChat);
// Get chat
router.get('/chats/:chatId', chatController.getChat);

// Delete message
router.delete('/chats/messages/:messageId', chatController.deleteMessage);



module.exports = router;
