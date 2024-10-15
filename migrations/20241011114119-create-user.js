// migrations/YYYYMMDDHHMMSS-create-user.js

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Users', {
      multiUserId: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      userName: {
        type: Sequelize.STRING,
        allowNull: false
      },
      currentRole: {
        type: Sequelize.JSON,
        defaultValue: [],
        allowNull: false
      },
      cnic: {
        type: Sequelize.STRING,
        allowNull: true
      },
      profilePicture: {
        type: Sequelize.STRING,
        allowNull: true
      },
      mobileNumber: {
        type: Sequelize.STRING,
        allowNull: true
      },
      otp: {
        type: Sequelize.STRING,
        allowNull: true
      },
      otpExpiry: {
        type: Sequelize.STRING,
        allowNull: true
      },
      resetPasswordToken: {
        type: Sequelize.STRING,
        allowNull: true
      },
      resetPasswordExpires: {
        type: Sequelize.STRING,
        allowNull: true
      },
      token: {
        type: Sequelize.STRING,
        allowNull: true
      },
      isVerified: {  // Adding the verification status field
        type: Sequelize.INTEGER,
        defaultValue: 0, // 0 = Not Verified, 1 = Verified
        allowNull: false
      },
      // locationId: {
      //   type: Sequelize.INTEGER,
      //   references: {
      //     model: 'Locations',
      //     key: 'locationId'
      //   },
      //   onDelete: 'SET NULL',
      //   allowNull: true
      // },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('Users');
  }
};
