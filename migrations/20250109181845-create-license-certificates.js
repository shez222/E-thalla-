'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('LicenseCertificates', {
      id: { // Primary Key
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
      },
      shopId: { // Foreign Key
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Shops', // Ensure this matches your actual table name
          key: 'shopId'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      certificateId: { // Unique identifier for the certificate
        type: Sequelize.STRING,
        allowNull: true
      },
      url: { // URL or path to the certificate image/file
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
          isUrl: true
        }
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

    // Add indexes if necessary
    // await queryInterface.addIndex('LicenseCertificates', ['shopId']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('LicenseCertificates');
  }
};
