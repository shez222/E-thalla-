// const Sequelize = require('sequelize');
// const sequelizeDbConnect = require('../utils/db');

// const ServiceProviderDetail = sequelizeDbConnect.define('ServiceProviderDetails', {
//     serviceProviderDetailsId: {
//         type: Sequelize.INTEGER,
//         allowNull: false,
//         primaryKey: true,
//         autoIncrement: true
//     },
//     experience: {
//         type: Sequelize.STRING,
//         allowNull: false
//     },
//     specialization: {
//         type: Sequelize.STRING,
//         allowNull: false
//     },
//     availability: {
//         type: Sequelize.JSON, // Nested JSON structure for availability
//         allowNull: false
//     },
//     previousWorkImages: {
//         type: Sequelize.JSON, // Array of images stored as JSON
//         allowNull: true
//     },
//     certificateImages: {
//         type: Sequelize.JSON, // Array of certificates stored as JSON
//         allowNull: true
//     }
// });

// module.exports = ServiceProviderDetail;

module.exports = (sequelize,DataTypes)=> {
    const ServiceProviderDetail = sequelize.define('ServiceProviderDetail', {
        serviceProviderDetailsId: {
          type: DataTypes.INTEGER,
          allowNull: false,
          primaryKey: true,
          autoIncrement: true
        },
        experience: {
          type: DataTypes.STRING,
          allowNull: false
        },
        specialization: {
          type: DataTypes.STRING,
          allowNull: false
        },
        availability: {
          type: DataTypes.JSON,
          allowNull: false
        },
        previousWorkImages: {
          type: DataTypes.JSON,
          allowNull: true,
          defaultValue: []
        },
        certificateImages: {
          type: DataTypes.JSON,
          allowNull: true,
          defaultValue: []
          
        }
      });
      
      ServiceProviderDetail.associate = function(models) {
        ServiceProviderDetail.belongsTo(models.User, {
          foreignKey: 'userId',
          as: 'user'
        });
      };

      return ServiceProviderDetail;
}