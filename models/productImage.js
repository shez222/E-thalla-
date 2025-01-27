// models/ProductImage.js
module.exports = (sequelize, DataTypes) => { 
  const ProductImage = sequelize.define('ProductImage', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true
    },
    productId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Products',
        key: 'id'
      }
    },
    imageId: { // Renamed from 'id' to 'imageId' to avoid confusion
      type: DataTypes.STRING,
      allowNull: false
    },
    url: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isUrl: true
      }
    }
  });

  ProductImage.associate = function(models) {
    ProductImage.belongsTo(models.Product, {
      foreignKey: 'productId',
      as: 'product'
    });
  };

  return ProductImage;
};











// module.exports = (sequelize, DataTypes) => {
//   const ProductImage = sequelize.define('ProductImage', {
//     id: {
//       type: DataTypes.INTEGER,
//       autoIncrement: true,
//       allowNull: false,
//       primaryKey: true
//     },
//     productId: {
//       type: DataTypes.INTEGER,
//       allowNull: false,
//       references: {
//         model: 'Products',
//         key: 'id'
//       }
//     },
//     imageId: { // Renamed from 'id' to 'imageId' to avoid confusion
//       type: DataTypes.STRING,
//       allowNull: false
//     },
//     url: {
//       type: DataTypes.STRING,
//       allowNull: false
//     }
//   });

//   return ProductImage;
// };
