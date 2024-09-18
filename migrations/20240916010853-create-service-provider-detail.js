// migrations/YYYYMMDDHHMMSS-create-service-provider-detail.js

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('ServiceProviderDetails', {
      serviceProviderDetailsId: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
      },
      experience: {
        type: Sequelize.STRING,
        allowNull: false
      },
      specialization: {
        type: Sequelize.STRING,
        allowNull: false
      },
      availability: {
        type: Sequelize.JSON,
        allowNull: false
      },
      previousWorkImages: {
        type: Sequelize.JSON,
        allowNull: true
      },
      certificateImages: {
        type: Sequelize.JSON,
        allowNull: true
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
          model: 'Users',
          key: 'multiUserId'
        },
        onDelete: 'CASCADE',
        allowNull: false
      }
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('ServiceProviderDetails');
  }
};
