'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('AvailabilityDays', {
      id: { // Primary Key
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
      },
      availabilityId: { // Foreign Key
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Availabilities',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      day: { // Day of the week
        type: Sequelize.STRING,
        allowNull: false
      },
      startTime: { // Opening time
        type: Sequelize.STRING,
        allowNull: true
      },
      endTime: { // Closing time
        type: Sequelize.STRING,
        allowNull: true
      },
      isClosed: { // Indicates if the shop is closed on this day
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
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
    await queryInterface.addIndex('AvailabilityDays', ['availabilityId']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('AvailabilityDays');
  }
};
