// migrations/create_shops_table.js
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Shops', {
      shopId: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
      },
      shopName: {
        type: Sequelize.STRING,
        allowNull: false
      },
      profilePicture: {
        type: Sequelize.STRING,
        allowNull: true
      },
      location: { // Updated Field
        type: Sequelize.JSON,
        allowNull: true,
        defaultValue: {
          lat: null,
          lng: null
        },
        validate: {
          isValidLocation(value) {
            if (value) {
              const { lat, lng } = value;
              if (typeof lat !== 'number' || typeof lng !== 'number') {
                throw new Error('Location must have numeric lat and lng.');
              }
            }
          }
        }
      },
      phone: {
        type: Sequelize.STRING,
        allowNull: false
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
          isEmail: true
        }
      },
      description: {
        type: Sequelize.STRING,
        allowNull: true
      },
      ownerName: {
        type: Sequelize.STRING,
        allowNull: true
      },
      vendorId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'VendorDetails', // Ensure this matches your actual table name
          key: 'vendorId'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      createdAt: { // Timestamps
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: { // Timestamps
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Shops');
  }
};















// // migrations/XXXXXXXXXXXXXX-create-shops.js

// module.exports = {
//   up: async (queryInterface, Sequelize) => {
//     await queryInterface.createTable('Shops', {
//       shopId: {
//         type: Sequelize.INTEGER,
//         autoIncrement: true,
//         allowNull: false,
//         primaryKey: true
//       },
//       shopName: {
//         type: Sequelize.STRING,
//         allowNull: false
//       },
//       profilePicture: {
//         type: Sequelize.STRING,
//         allowNull: true
//       },
//       location: { // Existing Field
//         type: Sequelize.JSON,
//         allowNull: true
//       },
//       // latitude: { // New Field
//       //   type: Sequelize.DECIMAL(10, 6),
//       //   allowNull: true
//       // },
//       // longitude: { // New Field
//       //   type: Sequelize.DECIMAL(10, 6),
//       //   allowNull: true
//       // },
//       phone: {
//         type: Sequelize.STRING,
//         allowNull: false
//       },
//       email: {
//         type: Sequelize.STRING,
//         allowNull: false,
//         validate: {
//           isEmail: true
//         }
//       },
//       description: {
//         type: Sequelize.STRING,
//         allowNull: true
//       },
//       ownerName: {
//         type: Sequelize.STRING,
//         allowNull: true
//       },
//       vendorId: {
//         type: Sequelize.INTEGER,
//         allowNull: true,
//         references: {
//           model: 'VendorDetails', // Ensure this matches your actual table name
//           key: 'vendorId'
//         },
//         onUpdate: 'CASCADE',
//         onDelete: 'SET NULL'
//       },
//       createdAt: { // Timestamps
//         allowNull: false,
//         type: Sequelize.DATE,
//         defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
//       },
//       updatedAt: { // Timestamps
//         allowNull: false,
//         type: Sequelize.DATE,
//         defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
//       }
//     });
//   },

//   down: async (queryInterface, Sequelize) => {
//     await queryInterface.dropTable('Shops');
//   }
// };
















// module.exports = {
//   up: async (queryInterface, Sequelize) => {
//     await queryInterface.createTable('Shops', {
//       shopId: {
//         type: Sequelize.INTEGER,
//         autoIncrement: true,
//         allowNull: false,
//         primaryKey: true
//       },
//       shopName: {
//         type: Sequelize.STRING,
//         allowNull: false
//       },
//       profilePicture: {
//         type: Sequelize.STRING,
//         allowNull: true
//       },
//       location: {
//         type: Sequelize.STRING,
//         allowNull: true
//       },
//       phone: {
//         type: Sequelize.STRING,
//         allowNull: false
//       },
//       email: {
//         type: Sequelize.STRING,
//         allowNull: false,
//         validate: {
//           isEmail: true
//         }
//       },
//       description: {
//         type: Sequelize.STRING,
//         allowNull: true
//       },
//       ownerName: {
//         type: Sequelize.STRING,
//         allowNull: true
//       },
//       vendorId: {
//         type: Sequelize.INTEGER,
//         allowNull: true,
//         references: {
//           model: 'VendorDetails', // Ensure this matches your actual table name
//           key: 'vendorId'
//         },
//         onUpdate: 'CASCADE',
//         onDelete: 'SET NULL'
//       },
//       createdAt: { // Timestamps
//         allowNull: false,
//         type: Sequelize.DATE,
//         defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
//       },
//       updatedAt: { // Timestamps
//         allowNull: false,
//         type: Sequelize.DATE,
//         defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
//       }
//     });
//   },

//   down: async (queryInterface, Sequelize) => {
//     await queryInterface.dropTable('Shops');
//   }
// };













// module.exports = {
//   up: async (queryInterface, Sequelize) => {
//     await queryInterface.createTable('Shops', {
//       shopId: {
//         type: Sequelize.INTEGER,
//         autoIncrement: true,
//         allowNull: false,
//         primaryKey: true
//       },
//       shopName: {
//         type: Sequelize.STRING,
//         allowNull: false
//       },
//       image: {
//         type: Sequelize.STRING,
//         allowNull: true
//       },
//       vendorId:{
//         type: Sequelize.INTEGER,
//         references: {
//           model: 'VendorDetails',
//           key: 'vendorId'
//         },
//         onDelete: 'CASCADE',
//         allowNull: false
//       },
//       location: {
//         type: Sequelize.STRING,
//         allowNull: true
//       },
//       description: {
//         type: Sequelize.STRING,
//         allowNull: true
//       },
//       ownerName: {
//         type: Sequelize.STRING,
//         allowNull: true
//       },
//       createdAt: {
//         type: Sequelize.DATE,
//         allowNull: false,
//         defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
//       },
//       updatedAt: {
//         type: Sequelize.DATE,
//         allowNull: false,
//         defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
//       }
//     });
//   },

//   down: async (queryInterface) => {
//     await queryInterface.dropTable('Shops');
//   }
// };
