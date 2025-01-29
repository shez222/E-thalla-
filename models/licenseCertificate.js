module.exports = (sequelize, DataTypes) => {
  const LicenseCertificate = sequelize.define('LicenseCertificate', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true
    },
    shopId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Shops', // Ensure this matches your actual table name
        key: 'shopId'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    certificateId: { // Represents the unique identifier for the certificate
      type: DataTypes.STRING,
      allowNull: true
    },
    url: { // URL or path to the certificate image/file
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isUrl: true // Ensures the URL is valid
      }
    },
    createdAt: { // Timestamps
      allowNull: false,
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    updatedAt: { // Timestamps
      allowNull: false,
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'LicenseCertificates', // Explicitly defining table name
    timestamps: true
  });

  LicenseCertificate.associate = function(models) {
    LicenseCertificate.belongsTo(models.Shop, {
      foreignKey: 'shopId',
      as: 'shop'
    });
  };

  return LicenseCertificate;
};
