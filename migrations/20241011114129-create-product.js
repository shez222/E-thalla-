
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Products', {
      id: { // Primary Key
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
      },
      title: { // Product Title
        type: Sequelize.STRING,
        allowNull: false
      },
      quality: { // Product Quality
        type: Sequelize.STRING,
        allowNull: false
      },
      quantity: { // Available Quantity
        type: Sequelize.STRING,
        allowNull: false
      },
      price: { // Product Price
        type: Sequelize.STRING, // Changed to STRING to accommodate formats like "700 PKR per bag"
        allowNull: false
      },
      description: { // Product Description
        type: Sequelize.STRING,
        allowNull: true
      },
      shopId: { // Foreign Key to Shops Table
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Shops', // Ensure that the 'Shops' table exists
          key: 'shopId' // Assuming 'id' is the primary key of 'Shops'. Change to 'shopId' if 'shopId' is the primary key.
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
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

    // Add indexes if necessary
    // await queryInterface.addIndex('Products', ['shopId']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Products');
  }
};














// module.exports = {
//   up: async (queryInterface, Sequelize) => {
//     await queryInterface.createTable('Products', {
//       id: { // Primary Key
//         type: Sequelize.INTEGER,
//         autoIncrement: true,
//         allowNull: false,
//         primaryKey: true
//       },
//       title: { // Changed from 'title' to 'itemName' if needed
//         type: Sequelize.STRING,
//         allowNull: false
//       },
//       quality: { // New field
//         type: Sequelize.STRING,
//         allowNull: false
//       },
//       quantity: { // New field
//         type: Sequelize.STRING,
//         allowNull: false
//       },
//       price: { // Changed to STRING to accommodate formats like "700 PKR per bag"
//         type: Sequelize.STRING,
//         allowNull: false
//       },
//       description: {
//         type: Sequelize.STRING,
//         allowNull: true
//       },
//       shopId: { // Foreign Key
//         type: Sequelize.INTEGER,
//         allowNull: false,
//         references: {
//           model: 'Shops',
//           key: 'shopId'
//         },
//         onUpdate: 'CASCADE',
//         onDelete: 'CASCADE'
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

//     // If you have additional indexes or constraints, add them here
//   },

//   down: async (queryInterface, Sequelize) => {
//     await queryInterface.dropTable('Products');
//   }
// };










