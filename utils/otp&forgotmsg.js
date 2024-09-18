const otpdata = (otp)=>{
    return {
        subject: "Your OTP Code - E-THALLA",
        html: `
            <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
                <div style="max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
                    <div style="background-color: #1a73e8; padding: 20px;">
                        <h1 style="color: #ffffff; text-align: center; margin: 0;">E-THALLA</h1>
                    </div>
                    <div style="padding: 30px; text-align: center;">
                        <h2 style="color: #333333;">Dear Customer,</h2>
                        <p style="color: #555555; font-size: 16px; line-height: 1.5;">
                            We are pleased to provide you with your One-Time Password (OTP) for secure access to your account.
                            Please use the following code to proceed:
                        </p>
                        <p style="font-size: 24px; font-weight: bold; color: #d32f2f; margin: 20px 0;">${otp}</p>
                        <p style="color: #555555; font-size: 16px; line-height: 1.5;">
                            If you did not request this code, please contact us immediately.
                        </p>
                        <p style="color: #555555; font-size: 16px; line-height: 1.5; margin-top: 30px;">
                            Thank you for choosing <strong>E-THALLA</strong>.
                        </p>
                    </div>
                    <div style="background-color: #f4f4f4; padding: 20px; text-align: center;">
                        <p style="color: #777777; font-size: 14px; margin: 0;">Best regards,</p>
                        <p style="color: #1a73e8; font-size: 14px; margin: 0;"><strong>E-THALLA Team</strong></p>
                    </div>
                </div>
            </div>
        `
    }
}

const forgotdata = (resetCode)=>{
    return {
        subject: "Reset Your Password - E-THALLA",
        html: `
            <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
                <div style="max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
                    <div style="background-color: #1a73e8; padding: 20px;">
                        <h1 style="color: #ffffff; text-align: center; margin: 0;">E-THALLA</h1>
                    </div>
                    <div style="padding: 30px; text-align: center;">
                        <h2 style="color: #333333;">Password Reset Request</h2>
                        <p style="color: #555555; font-size: 16px; line-height: 1.5;">
                            We received a request to reset the password for your E-THALLA account. Please use the following code in your mobile app to reset your password:
                        </p>
                        <p style="font-size: 24px; font-weight: bold; color: #d32f2f; margin: 20px 0;">${resetCode}</p>
                        <p style="color: #555555; font-size: 16px; line-height: 1.5;">
                            If you did not request a password reset, please ignore this email or contact support if you have any concerns.
                        </p>
                        <p style="color: #555555; font-size: 16px; line-height: 1.5; margin-top: 30px;">
                            Thank you for choosing <strong>E-THALLA</strong>.
                        </p>
                    </div>
                    <div style="background-color: #f4f4f4; padding: 20px; text-align: center;">
                        <p style="color: #777777; font-size: 14px; margin: 0;">Best regards,</p>
                        <p style="color: #1a73e8; font-size: 14px; margin: 0;"><strong>E-THALLA Team</strong></p>
                    </div>
                </div>
            </div>
        `
    }
}

module.exports = {otpdata, forgotdata}