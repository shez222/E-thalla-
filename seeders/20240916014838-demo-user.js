'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('Users', [
      {
        multiUserId: 1,
        password: 'hashedpassword1', // Make sure to use hashed passwords
        email: 'user1@example.com',
        userName: 'user1',
        currentRole: JSON.stringify(['user']), // Example roles
        cnic: '12345-6789012-3',
        profilePicture: 'http://example.com/profile1.jpg',
        mobileNumber: '123-456-7890',
        otp: '123456',
        otpExpiry: new Date(new Date().getTime() + 15 * 60000), // 15 minutes from now
        resetPasswordToken: 'resetToken1',
        resetPasswordExpires: new Date(new Date().getTime() + 1 * 3600000), // 1 hour from now
        token: 'authToken1',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        multiUserId: 2,
        password: 'hashedpassword2', // Make sure to use hashed passwords
        email: 'user2@example.com',
        userName: 'user2',
        currentRole: JSON.stringify(['admin']), // Example roles
        cnic: '23456-7890123-4',
        profilePicture: 'http://example.com/profile2.jpg',
        mobileNumber: '987-654-3210',
        otp: '654321',
        otpExpiry: new Date(new Date().getTime() + 15 * 60000), // 15 minutes from now
        resetPasswordToken: 'resetToken2',
        resetPasswordExpires: new Date(new Date().getTime() + 1 * 3600000), // 1 hour from now
        token: 'authToken2',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Users', null, {});
  }
};
