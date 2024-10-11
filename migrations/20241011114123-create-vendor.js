// // migrations/YYYYMMDDHHMMSS-create-vendor-detail.js

// module.exports = {
//   up: async (queryInterface, Sequelize) => {
//     await queryInterface.createTable('VendorDetails', {
//       vendorId: {
//         type: Sequelize.STRING,
//         allowNull: false,
//         primaryKey: true
//       },
//       name: {
//         type: Sequelize.STRING,
//         allowNull: false
//       },
//       company: {
//         type: Sequelize.STRING,
//         allowNull: false
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
//       previousWork: {
//         type: Sequelize.JSON,
//         allowNull: true
//       },
//       certifications: {
//         type: Sequelize.JSON,
//         allowNull: true
//       },
//       contactInfo: {
//         type: Sequelize.JSON,
//         allowNull: false
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
//     await queryInterface.dropTable('VendorDetails');
//   }
// };


// migrations/YYYYMMDDHHMMSS-create-vendor-detail.js

// migrations/XXXXXXXXXXXXXX-create-vendor-details.js

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('VendorDetails', {
      vendorId: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: true,
        primaryKey: true
      },
      phoneNumber: {
        type: Sequelize.STRING,
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      selectedItems: {
        type: Sequelize.JSON,
        allowNull: false
      },
      priceRange: {
        type: Sequelize.JSON,
        allowNull: false
      },
      timeSelection: {
        type: Sequelize.JSON,
        allowNull: false
      },
      selectedDays: {
        type: Sequelize.JSON,
        allowNull: true,
        defaultValue: []
      },
      uploadImages: {
        type: Sequelize.JSON,
        allowNull: true,
        defaultValue: {
          images: [],
          certificateImages: []
        }
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'multiUserId'
        },
        onDelete: 'CASCADE'
      },
      userId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Users',
          key: 'multiUserId'
        },
        onDelete: 'CASCADE',
        allowNull: false
      }

    });

  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('VendorDetails');
  }
};
