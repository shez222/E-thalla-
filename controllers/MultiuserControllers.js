
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto')
const  { sendEmail } = require('../utils/sendmail')
const {forgotdata, otpdata} = require('../utils/otp&forgotmsg')
const db = require('../models');
const {sendOtpCode} = require('../utils/sendOtp');
const MultiUser = db.User


const MultiuserRegister = async (req, res) => {
    const { email, username, password, confirmpassword, role } = req.body;

    try {
        const assignedRole = role && role !== 'user' ? ['user', role] : ['user'];

        if (password !== confirmpassword) {
            return res.status(422).json({ success: false, error: 'Passwords do not match' });
        }

        // Find user by email
        const user = await MultiUser.findOne({ where: { Email: email } });

        if (user) {
            const isEqual = await bcrypt.compare(password, user.password);
            if (!isEqual) {
                return res.status(400).json({ success: false, error: "Email already exists" });
            }

            const currentRoles = user.currentRole;

            const rolesToAdd = assignedRole.filter(role => !currentRoles.includes(role));

            if (rolesToAdd.length === 0) {
                return res.status(422).json({ success: false, error: `All selected roles are already assigned to this email` });
            }

            const updatedUser = await user.update({
                currentRole: [...currentRoles, ...rolesToAdd]
            });

            return res.json({
                success: true,
                user: updatedUser,
                msg: `Roles "${rolesToAdd.join(', ')}" added to user`
            });
        }

        const hashedpw = await bcrypt.hash(password, 12);

        const newUser = await MultiUser.create({
            userName: username,
            password: hashedpw,
            email: email,
            currentRole: assignedRole
        });

        await sendEmail(email, "Registration Successful", "Welcome to E-Thalla!");

        return res.json({
            success: true,
            user: newUser,
            msg: `User created successfully with roles "${assignedRole.join(', ')}"`
        });

    } catch (error) {
        const status = error.status || 500;
        res.status(status).json({ success: false, error: error.message });
    }
};



const MultiuserLogin = async (req, res, next) => {
    const { email, password } = req.body;

    try {
        const user = await MultiUser.findOne({
            where: { email: email }
        });

        if (!user) {
            return res.status(422).json({ error: 'Not Registered' });
        }

        const isEqual = await bcrypt.compare(password, user.password);
        if (!isEqual) {
            return res.status(422).json({ error: 'Wrong Password' });
        }

        // Check if the user is already verified
        if (user.isVerified) {
            // If verified, skip OTP and directly send token
            const token = jwt.sign(
                {
                    email: user.email,
                    userId: user.multiUserId.toString()
                },
                'somesupersecret', // Use environment variable
                {
                    expiresIn: '1h'
                }
            );
            return res.json({
                token: token,
                userId: user,
                msg: "User successfully logged in"
            });
        }

        // If not verified, send OTP
        const otp = await sendOtpCode(user);
        
        // Token creation
        const token = jwt.sign(
            {
                email: user.email,
                userId: user.multiUserId.toString()
            },
            'somesupersecret', // Use environment variable
            {
                expiresIn: '1h'
            }
        );
        
        await user.update({ token });

        return res.json({ 
            token: token, 
            userId: user,
            msg: "OTP Sent Successfully",
            otp: otp  // Only for testing, remove in production
        });

    } catch (error) {
        console.error(error);
        res.status(error.status || 500).json({ error: error.message });
    }
};

const resendOtp = async (req, res) => {
    const { email } = req.body;

    try {
        const user = await MultiUser.findOne({
            where: { email: email }
        });

        if (!user) {
            return res.status(422).json({ error: 'Not Registered' });
        }

        // Check if the user is already verified
        if (user.isVerified) {
            return res.status(200).json({ msg: "User is already verified. No OTP sent." });
        }

        // Resend OTP if not verified
        const otp = await sendOtpCode(user);

        return res.status(200).json({
            msg: "OTP Resent Successfully",
            otp: otp // Only for testing, remove in production
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to resend OTP" });
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
        otpExpiry:'',
        isVerified:1
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


// Get all users
const getAllUsers = async (req, res) => {
    try {
        const users = await MultiUser.findAll({
            attributes: ['multiUserId', 'username', 'email'] // Specify the fields you want to return
        });
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching users', error: error.message });
    }
};


// Get a user by ID
const getUserById = async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await MultiUser.findOne({ where: { multiUserId: userId } });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching user', error: error.message });
    }
};

// Update a user by ID
const updateUser = async (req, res) => {
    try {
        const userId = req.params.id;
        const { password, email, userName, currentRole, cnic, profilePicture, mobileNumber } = req.body;

        const user = await MultiUser.findOne({ where: { multiUserId: userId } });
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // user.email = email || user.email;
        user.userName = userName;
        // user.currentRole = currentRole || user.currentRole;
        // user.cnic = cnic || user.cnic;
        // user.profilePicture = profilePicture || user.profilePicture;
        // user.mobileNumber = mobileNumber || user.mobileNumber;

        await user.save();

        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: 'Error updating user', error: error.message });
    }
};

// Delete a user by ID
const deleteUser = async (req, res) => {
    try {
        const userId = req.params.id;

        const user = await MultiUser.findOne({ where: { multiUserId: userId } });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        await user.destroy();

        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting user', error: error.message });
    }
};

// controllers/userController.js

const { User } = require('../models');

// Add Balance to User's Wallet
const addWalletBalance = async (req, res) => {
  const { userId } = req.params;
  const { amount } = req.body;

  // Input validation
  if (!amount || isNaN(amount) || amount <= 0) {
    return res.status(400).json({ message: 'Invalid amount provided.' });
  }

  try {
    // Find the user
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Update the wallet balance
    const newBalance = parseFloat(user.walletBalance) + parseFloat(amount);
    user.walletBalance = newBalance.toFixed(2);
    await user.save();

    return res.status(200).json({
      message: 'Wallet balance updated successfully.',
      walletBalance: user.walletBalance
    });
  } catch (error) {
    console.error('Error updating wallet balance:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

// Optional: Get User's Wallet Balance
const getWalletBalance = async (req, res) => {
  const { userId } = req.params;

  try {
    // Find the user
    const user = await User.findByPk(userId, {
      attributes: ['walletBalance']
    });
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    return res.status(200).json({
      walletBalance: user.walletBalance
    });
  } catch (error) {
    console.error('Error fetching wallet balance:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

// Deduct Balance from User's Wallet
const deductWalletBalance = async (req, res) => {
    const { userId } = req.params;
    const { amount } = req.body;
  
    // Input validation
    if (amount === undefined || isNaN(amount) || amount <= 0) {
      return res.status(400).json({ message: 'Invalid amount provided.' });
    }
  
    try {
      // Find the user
      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found.' });
      }
  
      const currentBalance = parseFloat(user.walletBalance);
      const deductionAmount = parseFloat(amount);
  
      // Check for sufficient balance
      if (currentBalance < deductionAmount) {
        return res.status(400).json({ message: 'Insufficient wallet balance.' });
      }
  
      // Update the wallet balance
      const newBalance = currentBalance - deductionAmount;
      user.walletBalance = newBalance.toFixed(2);
      await user.save();
  
      return res.status(200).json({
        message: 'Wallet balance deducted successfully.',
        walletBalance: user.walletBalance
      });
    } catch (error) {
      console.error('Error deducting wallet balance:', error);
      return res.status(500).json({ message: 'Internal server error.' });
    }
  };
module.exports = {MultiuserRegister, MultiuserLogin, matchOtp, forgotPassword, verifyForgetCode, setNewPassword, getAllUsers, getUserById,deleteUser, updateUser, resendOtp, addWalletBalance, getWalletBalance, deductWalletBalance};



// const MultiuserLogin = async (req, res, next) => {
//     const { email, password } = req.body;

//     try {
//         const user = await MultiUser.findOne({
//             where: { email: email }
//         });

//         if (!user) {
//             return res.status(422).json({ error: 'Not Registered' });
//         }

//         const isEqual = await bcrypt.compare(password, user.password);
//         if (!isEqual) {
//             return res.status(422).json({ error: 'Wrong Password' });
//         }

//         const otp = crypto.randomInt(100000, 999999).toString();
//         const hashedOtp = await bcrypt.hash(otp, 12);
//         const otpData = otpdata(otp);
//         await sendEmail(email, otpData.html, otpData.subject);

//         const token = jwt.sign(
//             {
//                 email: user.Email,
//                 userId: user.multiUserId.toString()
//             },
//             'somesupersecret', // Use environment variable
//             {
//                 expiresIn: '1h'
//             }
//         );
        
//         await user.update({
//             otp: hashedOtp,
//             otpExpiry: Date.now() + 900000,//15min
//             token: token
//         });

//         return res.json({ 
//             token: token, 
//             userId: user,
//             msg:"OTP Send Successfully",
//             otp:otp

//         });

//     } catch (error) {
//         console.error(error);
//         res.status(error.status || 500).json({ error: error.message });
//     }
// };



// const MultiuserRegister = async (req, res) => {
//     const { email, username, password, confirmpassword,role} = req.body;
//     console.log(email);
    
    
//     try {
//         const user = await MultiUser.findOne({ where: { email: email } });
//         if (user) {
//             return res.json({ error: "User already registered. Please login." });
//         }

//         if (password !== confirmpassword) {
//             res.status(422).json("password not matched")
//         }

//         const hashedpw = await bcrypt.hash(password, 12);
//         const newUser = await MultiUser.create({
//             userName: username,
//             password: hashedpw,
//             email: email,
//             currentRole: [{ 'role': 'user' }] // Default role assigned as 'user'
//         });
//         return res.json({
//             user: newUser,
//             msg: `Successfully created user with default role 'user'`
//         });

//     } catch (error) {
//         if (!error.status) {
//             error.status = 500;
//         }
//         res.status(error.status).json({ error: error.message });
//     }
// };