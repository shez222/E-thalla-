module.exports = (sequelize, DataTypes) => {
  const Availability = sequelize.define('Availability', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true
    },
    shopId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Shops',
        key: 'shopId'
      }
    }
  });

  Availability.associate = function(models) {
    Availability.hasMany(models.AvailabilityDay, {
      foreignKey: 'availabilityId',
      as: 'days',
      onDelete: 'CASCADE'
    });
  };

  return Availability;
};
