// const Sequelize = require('sequelize');
// const sequelizeDbConnect = require('../utils/db');

// const VendorDetail = sequelizeDbConnect.define('VendorDetails', {
//     vendorId: {
//         type: Sequelize.STRING, // ID can be a string or UUID
//         allowNull: false,
//         primaryKey: true
//     },
//     name: {
//         type: Sequelize.STRING,
//         allowNull: false
//     },
//     company: {
//         type: Sequelize.STRING,
//         allowNull: false
//     },
//     experience: {
//         type: Sequelize.STRING, // Years of experience as string
//         allowNull: false
//     },
//     specialization: {
//         type: Sequelize.STRING, // List of specializations stored as a comma-separated string
//         allowNull: false
//     },
//     availability: {
//         type: Sequelize.JSON, // Nested JSON for availability
//         allowNull: false
//     },
//     previousWork: {
//         type: Sequelize.JSON, // Array of previous work, each containing project details
//         allowNull: true
//     },
//     certifications: {
//         type: Sequelize.JSON, // Array of certifications, each containing details
//         allowNull: true
//     },
//     contactInfo: {
//         type: Sequelize.JSON, // Nested JSON for contact info (email, phone, address)
//         allowNull: false
//     }
// });

// module.exports = VendorDetail;

module.exports=(sequelize,DataTypes)=>{    
    const VendorDetail = sequelize.define('VendorDetail', {
        vendorId: {
            type: DataTypes.STRING,
            allowNull: false,
            primaryKey: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        company: {
            type: DataTypes.STRING,
            allowNull: false
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
        previousWork: {
            type: DataTypes.JSON,
            allowNull: true
        },
        certifications: {
            type: DataTypes.JSON,
            allowNull: true
        },
        contactInfo: {
            type: DataTypes.JSON,
            allowNull: false
        }
        });
        
        VendorDetail.associate = function(models) {
        // Define associations here if needed
        VendorDetail.belongsTo(models.User, {
            foreignKey: 'userId',
            as: 'user'
          });
        };

        return VendorDetail;
}