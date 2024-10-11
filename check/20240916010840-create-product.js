// migrations/YYYYMMDDHHMMSS-create-product.js

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Products', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
      },
      title: {
        type: Sequelize.STRING
      },
      price: {
        type: Sequelize.DOUBLE,
        allowNull: false
      },
      imageUrl: {
        type: Sequelize.JSON,
        allowNull: true,
        default:[]
      },
      description: {
        type: Sequelize.STRING,
        allowNull: false
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      userId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Shops',
          key: 'shopId'
        },
        onDelete: 'CASCADE',
        allowNull: false
      }
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('Products');
  }
};
