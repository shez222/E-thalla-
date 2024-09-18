// const Sequelize = require('sequelize');
// const sequelizeDbConnect = require('../utils/db');

// const Location = sequelizeDbConnect.define('Locations', {
//     locationId: {
//         type: Sequelize.INTEGER,
//         allowNull: false,
//         autoIncrement: true,
//         primaryKey: true
//     },
//     address: {
//         type: Sequelize.STRING,
//         allowNull: true
//     },
//     city: {
//         type: Sequelize.STRING,
//         allowNull: true
//     },
//     state: {
//         type: Sequelize.STRING,
//         allowNull: true
//     },
//     country: {
//         type: Sequelize.STRING,
//         allowNull: true
//     },
//     postalCode: {
//         type: Sequelize.STRING,
//         allowNull: true
//     },
//     latitude: {
//         type: Sequelize.DECIMAL(9, 6), // Precision and scale for latitude
//         allowNull: true
//     },
//     longitude: {
//         type: Sequelize.DECIMAL(9, 6), // Precision and scale for longitude
//         allowNull: true
//     }
// });

// module.exports = Location;


module.exports=(sequelize,DataTypes)=>{
    const Location = sequelize.define('Location', {
        locationId: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          allowNull: false,
          primaryKey: true
        },
        address: {
          type: DataTypes.STRING,
          allowNull: true
        },
        city: {
          type: DataTypes.STRING,
          allowNull: true
        },
        state: {
          type: DataTypes.STRING,
          allowNull: true
        },
        country: {
          type: DataTypes.STRING,
          allowNull: true
        },
        postalCode: {
          type: DataTypes.STRING,
          allowNull: true
        },
        latitude: {
          type: DataTypes.DECIMAL(9, 6),
          allowNull: true
        },
        longitude: {
          type: DataTypes.DECIMAL(9, 6),
          allowNull: true
        }
      });
      
      Location.associate = function(models) {
        Location.belongsTo(models.User, {
          foreignKey: 'userId',
          as: 'user'
        });
      };

      return Location;
}