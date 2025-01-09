module.exports = (sequelize, DataTypes) => {
  const Product = sequelize.define('Product', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true
    },
    title: { // Changed from 'title' to 'itemName' if needed
      type: DataTypes.STRING,
      allowNull: false
    },
    quality: { // New field
      type: DataTypes.STRING,
      allowNull: false
    },
    quantity: { // New field
      type: DataTypes.STRING,
      allowNull: false
    },
    price: {
      type: DataTypes.STRING, // Changed to STRING to accommodate formats like "700 PKR per bag"
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




















// // const Sequelize = require('sequelize');
// // const sequelize = require('../utils/db');

// // const Product = sequelize.define('Products',{  //1st argument is model name & 2nd fields
// //     id: {
// //         type: Sequelize.INTEGER,
// //         autoIncrement: true,
// //         allowNull: false,
// //         primaryKey: true
// //     },
// //     title : Sequelize.STRING,  //if single attribute can be define without creating object
// //     price : {
// //         type: Sequelize.DOUBLE,
// //         allowNull: false
// //     },
// //     imageUrl: {
// //         type: Sequelize.STRING,
// //         allowNull: false
// //     },
// //     description: {
// //         type: Sequelize.STRING,
// //         allowNull: false
// //     }
// // })

// // module.exports = Product;

// module.exports = (sequelize,DataTypes)=> {
//     const Product = sequelize.define('Product', {
//         id: {
//           type: DataTypes.INTEGER,
//           autoIncrement: true,
//           allowNull: false,
//           primaryKey: true
//         },
//         title: {
//           type: DataTypes.STRING
//         },
//         price: {
//           type: DataTypes.DOUBLE,
//           allowNull: false
//         },
//         imageUrl: {
//           type: DataTypes.JSON,
//           allowNull: true,
//           default:[]
//         },
//         description: {
//           type: DataTypes.STRING,
//           allowNull: false
//         }
//       });
      
//       Product.associate = function(models) {
//         Product.belongsTo(models.Shop, {
//           foreignKey: 'shopId',
//           as: 'shop'
//         });
//         Product.belongsToMany(models.Cart, { through: models.CartItem });
//         Product.belongsToMany(models.Order, { through: models.OrderItem });
//       };

//       return Product;
// }