// const Sequelize = require('sequelize');
// const sequelize = require('../utils/db');

// const Cart = sequelize.define('Carts',{  //1st argument is model name & 2nd fields
//     id: {
//         type: Sequelize.INTEGER,
//         autoIncrement: true,
//         allowNull: false,
//         primaryKey: true
//     },
//     // userId: {
//     //     type:Sequelize.INTEGER,
//     //     references:{
//     //         model:'User',
//     //         key: 'user'
//     //     }
//     // }
// })

// module.exports = Cart;

module.exports = (sequelize,DataTypes)=>{
    const Cart = sequelize.define('Cart', {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          allowNull: false,
          primaryKey: true
        }
      });
      
      Cart.associate = function(models) {
        Cart.belongsTo(models.User, {
          foreignKey: 'userId',
          as: 'user'
        });
        Cart.belongsToMany(models.Product, { through: models.CartItem });
      };
      return Cart;
}
