// const Sequelize = require('sequelize');
// const sequelizeDbConnect =require('../utils/db');

// const MultiUser = sequelizeDbConnect.define('Users',{
//     multiUserId : {
//         type:Sequelize.INTEGER,
//         allowNull:true,
//         autoIncrement: true,
//         primaryKey:true
//     },
//     password : {
//         type:Sequelize.STRING,
//         allowNull:false
//     },
//     Email:{
//         type:Sequelize.STRING,
//         allowNull:false,
//         unique:true
//     },
//     userName:{
//         type: Sequelize.STRING,
//         allowNull:false
//     },
//     currentRole: {
//         type: Sequelize.JSON, // Use JSON to store array-like data
//         defaultValue: [], // Default value as an empty array
//         allowNull: false
//     },
//     // servicProviderDetals: {
//     //     type:Sequelize.INTEGER,
//     //     references:{
//     //         model:'ServicePovider',
//     //         key: 'serviceProviderDetailsId'
//     //     }
//     // },
//     // vendorDetals: {
//     //     type:Sequelize.INTEGER,
//     //     references:{
//     //         model:'Vendor',
//     //         key: 'vendorDetailsId'
//     //     }
//     // },
//     cnic : {
//         type:Sequelize.STRING,
//         allowNull:true
//     },
//     profilePicture: {
//         type:Sequelize.STRING,
//         allowNull:true
//     },
//     mobileNumber:{
//         type:Sequelize.STRING,
//         allowNull:true
//     },
//     otp :{
//         type:Sequelize.STRING,
//         allowNull:true
//     },
//     otpExpiry:{
//         type:Sequelize.STRING,
//         allowNull:true
//     },
//     resetPasswordToken :{
//         type:Sequelize.STRING,
//         allowNull:true
//     },
//     resetPasswordExpires:{
//         type:Sequelize.STRING,
//         allowNull:true
//     },
//     token: {
//         type:Sequelize.STRING,
//         allowNull:true
//     }
//     // location:{
//     //     type:Sequelize.INTEGER,
//     //     references:{
//     //         model: 'Location',
//     //         key: 'locationId'
//     //     }
//     // }
// })

// module.exports = MultiUser;

module.exports = (sequelize,DataTypes) =>{
    const User = sequelize.define('User', {
        multiUserId: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          allowNull: true,
          primaryKey: true
        },
        password: {
          type: DataTypes.STRING,
          allowNull: false
        },
        email: {
          type: DataTypes.STRING,
          allowNull: false,
          unique: true
        },
        userName: {
          type: DataTypes.STRING,
          allowNull: false
        },
        currentRole: {
          type: DataTypes.JSON,
          defaultValue: [],
          allowNull: false
        },
        cnic: {
          type: DataTypes.STRING,
          allowNull: true
        },
        profilePicture: {
          type: DataTypes.STRING,
          allowNull: true
        },
        mobileNumber: {
          type: DataTypes.STRING,
          allowNull: true
        },
        otp: {
          type: DataTypes.STRING,
          allowNull: true
        },
        otpExpiry: {
          type: DataTypes.STRING,
          allowNull: true
        },
        resetPasswordToken: {
          type: DataTypes.STRING,
          allowNull: true
        },
        resetPasswordExpires: {
          type: DataTypes.STRING,
          allowNull: true
        },
        token: {
          type: DataTypes.STRING,
          allowNull: true
        }
      });
      
      User.associate = function(models) {
        User.hasOne(models.Cart, { foreignKey: 'userId', as: 'cart' });
        User.hasMany(models.Product, { foreignKey: 'userId', as: 'products' });
        User.hasMany(models.Order, { foreignKey: 'userId', as: 'orders' });
      };
      
    return User;
}