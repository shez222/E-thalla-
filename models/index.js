// const Sequelize = require('sequelize');
// const config = require('../config/config.json');
// const fs = require('fs');
// const path = require('path');

// const env = process.env.NODE_ENV || 'development';
// const configEnv = config[env];

// const sequelize = new Sequelize(configEnv.database, configEnv.username, configEnv.password, {
//   host: configEnv.host,
//   port:configEnv.port,
//   dialect: configEnv.dialect,
//   logging: false
// });

// const db = {};

// fs.readdirSync(__dirname)
//   .filter(file => file !== 'index.js')
//   .forEach(file => {
//     const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
//     db[model.name] = model;
//   });

// Object.keys(db).forEach(modelName => {
//   if (db[modelName].associate) {
//     db[modelName].associate(db);
//   }
// });

// db.sequelize = sequelize;
// db.Sequelize = Sequelize;

// module.exports = db;


const Sequelize = require('sequelize');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

// Use Clever Cloud environment variables for database connection
const database = process.env.MYSQL_ADDON_DB;
const username = process.env.MYSQL_ADDON_USER;
const password = process.env.MYSQL_ADDON_PASSWORD;
const host = process.env.MYSQL_ADDON_HOST;
const port = process.env.MYSQL_ADDON_PORT;
const dialect = 'mysql'; // As Clever Cloud is providing MySQL
console.log(database, username, password, host, port, dialect);


// Initialize Sequelize with the Clever Cloud credentials
const sequelize = new Sequelize(database, username, password, {
  host: host,
  port: port,
  dialect: dialect,
  logging: false, // Disable logging, set to true for debugging
});

const db = {};

// Read all model files and add them to the `db` object
fs.readdirSync(__dirname)
  .filter(file => file !== 'index.js')
  .forEach(file => {
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
  });

// Associate models if applicable
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
