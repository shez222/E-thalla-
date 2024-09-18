
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto')
const  { sendEmail } = require('../utils/sendmail')
const {forgotdata, otpdata} = require('../utils/otp&forgotmsg')
const MultiUser = require('../models/User');


const MultiuserRegister = async (req, res) => {
    const { email, username, password, confirmpassword,role} = req.body;
    
    try {
        const user = await MultiUser.findOne({ where: { Email: email } });
        if (user) {
            return res.json({ error: "User already registered. Please login." });
        }

        if (password !== confirmpassword) {
            res.status(422).json("password not matched")
        }

        const hashedpw = await bcrypt.hash(password, 12);
        const newUser = await MultiUser.create({
            userName: username,
            password: hashedpw,
            Email: email,
            currentRole: [{ 'role': 'user' }] // Default role assigned as 'user'
        });
        return res.json({
            user: newUser,
            msg: `Successfully created user with default role 'user'`
        });

    } catch (error) {
        if (!error.status) {
            error.status = 500;
        }
        res.status(error.status).json({ error: error.message });
    }
};



const MultiuserLogin = async (req, res, next) => {
    const { email, password } = req.body;

    try {
        const user = await MultiUser.findOne({
            where: { Email: email }
        });

        if (!user) {
            return res.status(422).json({ error: 'Not Registered' });
        }

        const isEqual = await bcrypt.compare(password, user.password);
        if (!isEqual) {
            return res.status(422).json({ error: 'Wrong Password' });
        }

        const otp = crypto.randomInt(100000, 999999).toString();
        const hashedOtp = await bcrypt.hash(otp, 12);
        const otpData = otpdata(otp);
        await sendEmail(email, otpData.html, otpData.subject);

        const token = jwt.sign(
            {
                email: user.Email,
                userId: user.multiUserId.toString()
            },
            'somesupersecret', // Use environment variable
            {
                expiresIn: '1h'
            }
        );
        
        await user.update({
            otp: hashedOtp,
            otpExpiry: Date.now() + 900000,//15min
            token: token
        });

        return res.json({ 
            token: token, 
            userId: user.multiUserId,
            msg:"OTP Send Successfully"
        });

    } catch (error) {
        console.error(error);
        res.status(error.status || 500).json({ error: error.message });
    }
};


const matchOtp = async(req,res)=>{

    const { email,otp } = req.body;
    
    const user = await MultiUser.findOne({
        where:{
            Email:email
        }
    })

    if (!user || !user.otp || !user.otpExpiry) {
        return res.status(422).json({ error : 'user not allowed'})
    }
    const isCodeValid = await bcrypt.compare(otp, user.otp);
    if (!isCodeValid || user.otpExpiry < Date.now()) {
        return res.status(400).send('Invalid or expired password reset code');
    }
    
    const updateuser = await user.update({
        otp:'',
        otpExpiry:''
    })
    console.log(updateuser);
    
    
    return res.json({ 
        userId: user.multiUserId,
        msg:'successfully login' 
    });

}

const forgotPassword = async (req, res) => {
    const { email } = req.body;

    try {
        // Find the user by email
        const user = await MultiUser.findOne({
            where: { email: email }
        });

        if (!user) {
            return res.status(404).send({msg : 'User not found'});
        }

        // Generate a reset code (e.g., 6-digit code)
        const resetCode = crypto.randomInt(100000, 999999).toString();
        const hashedCode = await bcrypt.hash(resetCode, 12);

        // Save the hashed code and expiry to the user's record
 
        const forgotData = forgotdata(resetCode);
        await sendEmail(email, forgotData.html, forgotData.subject);
        
        const updateUser = await user.update({
            resetPasswordToken: hashedCode,
            resetPasswordExpires: Date.now() + 900000 // 15 minutes,
        })   
        console.log(updateUser);
        
        res.json({
            message: 'Reset code sent successfully',
            email: email
        });
    } catch (error) {
        // console.log(error);
        
        res.status(500).json({
            message: 'An error occurred',
            error: error.message
        });
    }
}

const verifyForgetCode = async (req, res) => {
    const { email, resetCode } = req.body;

    try {
        // Find the user
        
        const user = await MultiUser.findOne({
            where: { email: email }
        });
        // console.log(user);
        
        if (!user || !user.resetPasswordToken) {
            return res.status(400).send('Invalid or expired password reset code');
        }

        // Check if the reset code is valid and not expired
        const isCodeValid = await bcrypt.compare(resetCode, user.resetPasswordToken);
        if (!isCodeValid || user.resetPasswordExpires < Date.now()) {
            return res.status(400).send('Invalid or expired password reset code');
        }

        // If valid, return a success message
        res.status(200).json({
            message: 'Reset code verified successfully',
            resetCodeValid: true
        });
    } catch (error) {
        res.status(500).json({
            message: 'An error occurred',
            error: error.message
        });
    }
}

const setNewPassword = async (req, res) => {
    const { email, newPassword } = req.body;

    try {
        // Find the user
        const user = await MultiUser.findOne({
            where: { email: email }
        });

        if (!user || !user.resetPasswordToken) {
            return res.status(400).send({msg:'Invalid request. Reset password process not initiated or token expired.'});
        }

        // Update the user's password
        const hashedPassword = await bcrypt.hash(newPassword, 12);
        user.password = hashedPassword;

        // Clear the reset token fields
        user.resetPasswordToken = null;
        user.resetPasswordExpires = null;
        await user.save();

        res.status(200).send({message:'Password has been reset successfully'});
    } catch (error) {
        res.status(500).json({
            message: 'An error occurred',
            error: error.message
        });
    }
}
module.exports = {MultiuserRegister, MultiuserLogin, matchOtp, forgotPassword, verifyForgetCode, setNewPassword}

