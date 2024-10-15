const crypto = require('crypto')
const bcrypt = require('bcrypt');
const {otpdata} = require('../utils/otp&forgotmsg')
const  { sendEmail } = require('../utils/sendmail')


const sendOtpCode = async (user) => {
  const otp = crypto.randomInt(100000, 999999).toString();
  const hashedOtp = await bcrypt.hash(otp, 12);

  // Prepare email content
  const otpData = otpdata(otp);
  await sendEmail(user.email, otpData.html, otpData.subject);

  // Update user with new OTP and expiry time
  await user.update({
      otp: hashedOtp,
      otpExpiry: Date.now() + 900000 // 15 minutes expiry
  });

  return otp;  // Return OTP if needed (for testing or debug purposes)
};

module.exports = { sendOtpCode }