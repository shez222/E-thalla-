const express = require('express')
const MultiUserController = require('../controllers/MultiuserControllers')
const multer = require('multer');

const router = express.Router()


const storage = multer.memoryStorage(); // Using memory storage since we're not handling files
router.use(multer({ storage: storage }).none())

router.post('/user/register', MultiUserController.MultiuserRegister);
router.post('/user/login', MultiUserController.MultiuserLogin)
router.post('/user/match-otp', MultiUserController.matchOtp)
// Forgot password APIs
router.post('/api/forgot-password', MultiUserController.forgotPassword );
router.post('/api/verify-reset-code', MultiUserController.verifyForgetCode );
router.post('/api/set-new-password', MultiUserController.setNewPassword);
// ---------------------------------------------
// Get all users
router.get('/users', MultiUserController.getAllUsers);

// Get a user by ID
router.get('/users/:id', MultiUserController.getUserById);

// Update a user by ID
router.put('/users/:id', MultiUserController.updateUser);

// Delete a user by ID
router.delete('/users/:id', MultiUserController.deleteUser);

module.exports = router;
