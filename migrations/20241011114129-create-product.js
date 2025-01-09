module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Products', {
      id: { // Primary Key
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
      },
      title: { // Changed from 'title' to 'itemName' if needed
        type: Sequelize.STRING,
        allowNull: false
      },
      quality: { // New field
        type: Sequelize.STRING,
        allowNull: false
      },
      quantity: { // New field
        type: Sequelize.STRING,
        allowNull: false
      },
      price: { // Changed to STRING to accommodate formats like "700 PKR per bag"
        type: Sequelize.STRING,
        allowNull: false
      },
      description: {
        type: Sequelize.STRING,
        allowNull: true
      },
      shopId: { // Foreign Key
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Shops',
          key: 'shopId'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
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

    // If you have additional indexes or constraints, add them here
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Products');
  }
};

















// // migrations/YYYYMMDDHHMMSS-create-product.js

// module.exports = {
//   up: async (queryInterface, Sequelize) => {
//     await queryInterface.createTable('Products', {
//       id: {
//         type: Sequelize.INTEGER,
//         autoIncrement: true,
//         allowNull: false,
//         primaryKey: true
//       },
//       title: {
//         type: Sequelize.STRING
//       },
//       price: {
//         type: Sequelize.DOUBLE,
//         allowNull: false
//       },
//       imageUrl: {
//         type: Sequelize.JSON,
//         allowNull: true,
//         default:[]
//       },
//       description: {
//         type: Sequelize.STRING,
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
//       shopId: {
//         type: Sequelize.INTEGER,
//         references: {
//           model: 'Shops',
//           key: 'shopId'
//         },
//         onDelete: 'CASCADE',
//         allowNull: false
//       }
//     });
//   },

//   down: async (queryInterface) => {
//     await queryInterface.dropTable('Products');
//   }
// };
