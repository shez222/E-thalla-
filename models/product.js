// const Sequelize = require('sequelize');
// const sequelize = require('../utils/db');

// const Product = sequelize.define('Products',{  //1st argument is model name & 2nd fields
//     id: {
//         type: Sequelize.INTEGER,
//         autoIncrement: true,
//         allowNull: false,
//         primaryKey: true
//     },
//     title : Sequelize.STRING,  //if single attribute can be define without creating object
//     price : {
//         type: Sequelize.DOUBLE,
//         allowNull: false
//     },
//     imageUrl: {
//         type: Sequelize.STRING,
//         allowNull: false
//     },
//     description: {
//         type: Sequelize.STRING,
//         allowNull: false
//     }
// })

// module.exports = Product;

module.exports = (sequelize,DataTypes)=> {
    const Product = sequelize.define('Product', {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          allowNull: false,
          primaryKey: true
        },
        title: {
          type: DataTypes.STRING
        },
        price: {
          type: DataTypes.DOUBLE,
          allowNull: false
        },
        imageUrl: {
          type: DataTypes.STRING,
          allowNull: false
        },
        description: {
          type: DataTypes.STRING,
          allowNull: false
        }
      });
      
      Product.associate = function(models) {
        Product.belongsTo(models.User, {
          foreignKey: 'userId',
          as: 'user'
        });
        Product.belongsToMany(models.Cart, { through: models.CartItem });
        Product.belongsToMany(models.Order, { through: models.OrderItem });
      };

      return Product;
}