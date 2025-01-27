// models/Product.js
module.exports = (sequelize, DataTypes) => {
  const Product = sequelize.define('Product', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    quality: {
      type: DataTypes.STRING,
      allowNull: false
    },
    quantity: {
      type: DataTypes.STRING,
      allowNull: false
    },
    price: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true
    }
  });

  Product.associate = function(models) {
    Product.belongsTo(models.Shop, {
      foreignKey: 'shopId',
      as: 'shop'
    });
    Product.belongsToMany(models.Cart, { through: models.CartItem });
    Product.belongsToMany(models.Order, { through: models.OrderItem });
    Product.hasMany(models.ProductImage, {
      foreignKey: 'productId',
      as: 'images',
      onDelete: 'CASCADE'
    });
  };

  return Product;
};












// module.exports = (sequelize, DataTypes) => {
//   const Product = sequelize.define('Product', {
//     id: {
//       type: DataTypes.INTEGER,
//       autoIncrement: true,
//       allowNull: false,
//       primaryKey: true
//     },
//     title: { // Changed from 'title' to 'itemName' if needed
//       type: DataTypes.STRING,
//       allowNull: false
//     },
//     quality: { // New field
//       type: DataTypes.STRING,
//       allowNull: false
//     },
//     quantity: { // New field
//       type: DataTypes.STRING,
//       allowNull: false
//     },
//     price: {
//       type: DataTypes.STRING, // Changed to STRING to accommodate formats like "700 PKR per bag"
//       allowNull: false
//     },
//     description: {
//       type: DataTypes.STRING,
//       allowNull: true
//     }
//   });

//   Product.associate = function(models) {
//     Product.belongsTo(models.Shop, {
//       foreignKey: 'shopId',
//       as: 'shop'
//     });
//     Product.belongsToMany(models.Cart, { through: models.CartItem });
//     Product.belongsToMany(models.Order, { through: models.OrderItem });
//     Product.hasMany(models.ProductImage, {
//       foreignKey: 'productId',
//       as: 'images',
//       onDelete: 'CASCADE'
//     });
//   };

//   return Product;
// };