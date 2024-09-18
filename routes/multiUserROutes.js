const express = require('express')
const MultiUserController = require('../controllers/MultiuserControllers')


const router = express.Router()


router.post('/user/register',MultiUserController.MultiuserRegister);
router.post('/user/login',MultiUserController.MultiuserLogin)
router.post('/user/match-otp',MultiUserController.matchOtp)
//forgot pass api
router.post('/api/forgot-password', MultiUserController.forgotPassword );
router.post('/api/verify-reset-code',MultiUserController.verifyForgetCode );
router.post('/api/set-new-password',MultiUserController.setNewPassword);


module.exports = router;