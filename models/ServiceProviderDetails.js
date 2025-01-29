// models/ServiceProviderDetail.js

module.exports = (sequelize, DataTypes) => {
  const ServiceProviderDetail = sequelize.define('ServiceProviderDetail', {
    serviceProviderDetailsId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    name: { // New Field
      type: DataTypes.STRING,
      allowNull: false
    },
    email: { // New Field
      type: DataTypes.STRING,
      allowNull: false,
      // validate: {
      //   isEmail: true
      // }
    },
    phone: { // New Field
      type: DataTypes.STRING,
      allowNull: false
    },
    profilePicture: { // New Field
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isUrl: true
      }
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
    // ... existing fields
    specialization: {
      type: DataTypes.JSON,
      allowNull: false,
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
    },
    hourlyRate: {
      type: DataTypes.STRING,
      allowNull: true
    },
    languagesSpoken: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: []
    },
    bio: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    socialLinks: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: {}
    },
    serviceArea: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: []
    },
    paymentTerms: {
      type: DataTypes.STRING,
      allowNull: true
    },
    tools: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: []
    },
    certifications: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: []
    },
    emergencyServices: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false
    },
    warranty: {
      type: DataTypes.STRING,
      allowNull: true
    },
    reviews: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: []
    },
    status: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: 'Active'
    },
    yearsInBusiness: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    preferredContactMethod: {
      type: DataTypes.STRING,
      allowNull: true
    },
    pastProjects: {
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
};
