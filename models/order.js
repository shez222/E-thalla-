// const Sequelize = require('sequelize');
// const sequelize = require('../utils/db');

// const Order = sequelize.define('Orders',{  //1st argument is model name & 2nd fields
//     id: {
//         type: Sequelize.INTEGER,
//         autoIncrement: true,
//         allowNull: false,
//         primaryKey: true
//     }
// })

// module.exports = Order;

module.exports = (sequelize,DataTypes)=>{
    const Order = sequelize.define('Order', {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          allowNull: false,
          primaryKey: true
        }
      });
      
      Order.associate = function(models) {
        Order.belongsTo(models.User, {
          foreignKey: 'userId',
          as: 'user'
        });
        Order.belongsToMany(models.Product, { through: models.OrderItem });
      };

      return Order;
}