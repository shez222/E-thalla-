const nodemailer = require('nodemailer');

const transproter = nodemailer.createTransport({
    service:'gmail',
    auth:{
        user:'bilal.shehroz420@gmail.com',
        pass:'plqx affv dlaf oxpj'
    }
});

const sendEmail = async(receiverMail, html, subject) => {
    const mailOptions = {
        from: 'bilal.shehroz420@gmail.com',
        to: receiverMail,
        subject: subject,
        html:html
    }

    try {
        await transproter.sendMail(mailOptions)
        console.log("Email Send SuccessFully");
    } catch (error) {
        console.log('error sending mail');
        throw new Error("Error Sentding Otp")
    }

}

module.exports = { sendEmail };




// const mailOptions = {
//     from: 'bilal.shehroz420@gmail.com',
//     to: receiverMail,
//     subject: "Reset Your Password - E-THALLA",
//     html: `
//         <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
//             <div style="max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
//                 <div style="background-color: #1a73e8; padding: 20px;">
//                     <h1 style="color: #ffffff; text-align: center; margin: 0;">E-THALLA</h1>
//                 </div>
//                 <div style="padding: 30px; text-align: center;">
//                     <h2 style="color: #333333;">Password Reset Request</h2>
//                     <p style="color: #555555; font-size: 16px; line-height: 1.5;">
//                         We received a request to reset the password for your E-THALLA account. If you made this request, please click the button below to change your password.
//                     </p>
//                     <a href="${resetLink}" style="display: inline-block; padding: 15px 25px; margin: 20px 0; font-size: 18px; color: #ffffff; background-color: #1a73e8; text-decoration: none; border-radius: 5px;">Reset Password</a>
//                     <p style="color: #555555; font-size: 16px; line-height: 1.5;">
//                         If you did not request a password reset, please ignore this email or contact support if you have any concerns.
//                     </p>
//                     <p style="color: #555555; font-size: 16px; line-height: 1.5; margin-top: 30px;">
//                         Thank you for choosing <strong>E-THALLA</strong>.
//                     </p>
//                 </div>
//                 <div style="background-color: #f4f4f4; padding: 20px; text-align: center;">
//                     <p style="color: #777777; font-size: 14px; margin: 0;">Best regards,</p>
//                     <p style="color: #1a73e8; font-size: 14px; margin: 0;"><strong>E-THALLA Team</strong></p>
//                 </div>
//             </div>
//         </div>
//     `
// }