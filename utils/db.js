const Sequelize = require('sequelize');

const sequelize = new Sequelize('constructiondb','root','03203024514',{
    dialect:'mysql',
    host:'localhost'
})


module.exports = sequelize