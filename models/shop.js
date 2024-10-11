module.exports = (sequelize, DataTypes) => {
  const Shop = sequelize.define('Shop', {
    shopId: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true
    },
    shopName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    image: {
      type: DataTypes.STRING,
      allowNull: true
    },
    location: {
      type: DataTypes.STRING,
      allowNull: true
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true
    },
    ownerName: {
      type: DataTypes.STRING,
      allowNull: true
    }
  });

  // Define associations
  Shop.associate = function(models) {
    Shop.belongsTo(models.VendorDetail, {
        foreignKey: 'vendorId',
        as: 'vendor'
    });
    // Assuming that a shop has many products
    Shop.hasMany(models.Product, {
      foreignKey: 'shopId',
      as: 'products',
      onDelete: 'CASCADE'
    });
  };

  return Shop;
};
