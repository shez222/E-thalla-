module.exports = (sequelize, DataTypes) => {
  const AvailabilityDay = sequelize.define('AvailabilityDay', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true
    },
    availabilityId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Availabilities',
        key: 'id'
      }
    },
    day: {
      type: DataTypes.STRING,
      allowNull: false
    },
    startTime: {
      type: DataTypes.STRING,
      allowNull: true
    },
    endTime: {
      type: DataTypes.STRING,
      allowNull: true
    },
    isClosed: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    }
  });

  return AvailabilityDay;
};
