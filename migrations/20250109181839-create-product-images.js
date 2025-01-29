
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('ProductImages', {
      id: { // Primary Key
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
      },
      productId: { // Foreign Key to Products Table
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Products', // Ensure that the 'Products' table exists
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      imageId: { // Unique Identifier for the Image (Optional)
        type: Sequelize.STRING,
        allowNull: true,
        // unique: true // Ensures that each imageId is unique
      },
      url: { // URL or Path to the Image
        type: Sequelize.STRING,
        allowNull: false
      },
      createdAt: { // Timestamp
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: { // Timestamp
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Add indexes to optimize queries
    // await queryInterface.addIndex('ProductImages', ['productId']);
    // await queryInterface.addIndex('ProductImages', ['imageId'], { unique: true });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('ProductImages');
  }
};













// 'use strict';

// module.exports = {
//   up: async (queryInterface, Sequelize) => {
//     await queryInterface.createTable('ProductImages', {
//       id: { // Primary Key
//         type: Sequelize.INTEGER,
//         autoIncrement: true,
//         allowNull: false,
//         primaryKey: true
//       },
//       productId: { // Foreign Key
//         type: Sequelize.INTEGER,
//         allowNull: false,
//         references: {
//           model: 'Products',
//           key: 'id'
//         },
//         onUpdate: 'CASCADE',
//         onDelete: 'CASCADE'
//       },
//       imageId: { // Renamed from 'id' to 'imageId' to avoid confusion
//         type: Sequelize.STRING,
//         allowNull: false
//       },
//       url: { // URL or path to the image
//         type: Sequelize.STRING,
//         allowNull: false,
//         validate: {
//           isUrl: true
//         }
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

//     // Add indexes if necessary
//     await queryInterface.addIndex('ProductImages', ['productId']);
//   },

//   down: async (queryInterface, Sequelize) => {
//     await queryInterface.dropTable('ProductImages');
//   }
// };
