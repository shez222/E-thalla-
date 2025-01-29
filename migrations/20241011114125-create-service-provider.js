// migrations/XXXXXXXXXXXXXX-create-service-provider-details.js

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('ServiceProviderDetails', {
      serviceProviderDetailsId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
      },
      name: { // New Field
        type: Sequelize.STRING,
        allowNull: false
      },
      email: { // New Field
        type: Sequelize.STRING,
        allowNull: false
      },
      phone: { // New Field
        type: Sequelize.STRING,
        allowNull: false
      },
      profilePicture: { // New Field
        type: Sequelize.STRING,
        allowNull: true
      },
      location: { // New Field
        type: Sequelize.JSON,
        allowNull: true
      },
      // ... existing fields
      specialization: {
        type: Sequelize.JSON,
        allowNull: false
      },
      availability: {
        type: Sequelize.JSON,
        allowNull: false
      },
      previousWorkImages: {
        type: Sequelize.JSON,
        allowNull: true,
        defaultValue: []
      },
      certificateImages: {
        type: Sequelize.JSON,
        allowNull: true,
        defaultValue: []
      },
      hourlyRate: {
        type: Sequelize.STRING,
        allowNull: true
      },
      languagesSpoken: {
        type: Sequelize.JSON,
        allowNull: true,
        defaultValue: []
      },
      bio: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      socialLinks: {
        type: Sequelize.JSON,
        allowNull: true,
        defaultValue: {}
      },
      serviceArea: {
        type: Sequelize.JSON,
        allowNull: true,
        defaultValue: []
      },
      paymentTerms: {
        type: Sequelize.STRING,
        allowNull: true
      },
      tools: {
        type: Sequelize.JSON,
        allowNull: true,
        defaultValue: []
      },
      certifications: {
        type: Sequelize.JSON,
        allowNull: true,
        defaultValue: []
      },
      emergencyServices: {
        type: Sequelize.BOOLEAN,
        allowNull: true,
        defaultValue: false
      },
      warranty: {
        type: Sequelize.STRING,
        allowNull: true
      },
      reviews: {
        type: Sequelize.JSON,
        allowNull: true,
        defaultValue: []
      },
      status: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: 'Active'
      },
      yearsInBusiness: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      preferredContactMethod: {
        type: Sequelize.STRING,
        allowNull: true
      },
      pastProjects: {
        type: Sequelize.JSON,
        allowNull: true,
        defaultValue: []
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users', // Ensure this matches your actual Users table name
          key: 'multiUserId' // Ensure this matches the primary key in Users table
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Optional: Add unique constraint on email if required
    // await queryInterface.addConstraint('ServiceProviderDetails', {
    //   fields: ['email'],
    //   type: 'unique',
    //   name: 'unique_email_constraint'
    // });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('ServiceProviderDetails');
  }
};













// // migrations/YYYYMMDDHHMMSS-create-service-provider-detail.js

// module.exports = {
//   up: async (queryInterface, Sequelize) => {
//     await queryInterface.createTable('ServiceProviderDetails', {
//       serviceProviderDetailsId: {
//         type: Sequelize.INTEGER,
//         autoIncrement: true,
//         allowNull: false,
//         primaryKey: true
//       },
//       experience: {
//         type: Sequelize.STRING,
//         allowNull: false
//       },
//       specialization: {
//         type: Sequelize.STRING,
//         allowNull: false
//       },
//       availability: {
//         type: Sequelize.JSON,
//         allowNull: false
//       },
//       previousWorkImages: {
//         type: Sequelize.JSON,
//         allowNull: true,
//         defaultValue: []

//       },
//       certificateImages: {
//         type: Sequelize.JSON,
//         allowNull: true,
//         defaultValue: []

//       },
//       createdAt: {
//         type: Sequelize.DATE,
//         allowNull: false
//       },
//       updatedAt: {
//         type: Sequelize.DATE,
//         allowNull: false
//       },
//       userId: {
//         type: Sequelize.INTEGER,
//         references: {
//           model: 'Users',
//           key: 'multiUserId'
//         },
//         onDelete: 'CASCADE',
//         allowNull: false
//       }
//     });
//   },

//   down: async (queryInterface) => {
//     await queryInterface.dropTable('ServiceProviderDetails');
//   }
// };
