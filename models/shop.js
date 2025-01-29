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
    profilePicture: { // Renamed from 'image' to 'profilePicture'
      type: DataTypes.STRING,
      allowNull: true
    },
    location: { // New Field
      type: DataTypes.JSON,
      allowNull: true,
      // Optionally, you can add a custom validator to ensure it has lat and lng
      validate: {
        isValidLocation(value) {
          if (value && (typeof value.lat !== 'number' || typeof value.lng !== 'number')) {
            throw new Error('Location must contain valid lat and lng as numbers.');
          }
        }
      }
    },
    phone: { // New field
      type: DataTypes.STRING,
      allowNull: false
    },
    email: { // New field
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isEmail: true
      }
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
    Shop.hasMany(models.Product, {
      foreignKey: 'shopId',
      as: 'products',
      onDelete: 'CASCADE'
    });
    Shop.hasOne(models.Availability, {
      foreignKey: 'shopId',
      as: 'availability',
      onDelete: 'CASCADE'
    });
    Shop.hasMany(models.LicenseCertificate, {
      foreignKey: 'shopId',
      as: 'licensesAndCertificates',
      onDelete: 'CASCADE'
    });
  };

  return Shop;
};















// module.exports = (sequelize, DataTypes) => {
//   const Shop = sequelize.define('Shop', {
//     shopId: {
//       type: DataTypes.INTEGER,
//       autoIncrement: true,
//       allowNull: false,
//       primaryKey: true
//     },
//     shopName: {
//       type: DataTypes.STRING,
//       allowNull: false
//     },
//     image: {
//       type: DataTypes.STRING,
//       allowNull: true
//     },
//     location: {
//       type: DataTypes.STRING,
//       allowNull: true
//     },
//     description: {
//       type: DataTypes.STRING,
//       allowNull: true
//     },
//     ownerName: {
//       type: DataTypes.STRING,
//       allowNull: true
//     }
//   });

//   // Define associations
//   Shop.associate = function(models) {
//     Shop.belongsTo(models.VendorDetail, {
//         foreignKey: 'vendorId',
//         as: 'vendor'
//     });
//     // Assuming that a shop has many products
//     Shop.hasMany(models.Product, {
//       foreignKey: 'shopId',
//       as: 'products',
//       onDelete: 'CASCADE'
//     });
//   };

//   return Shop;
// };
