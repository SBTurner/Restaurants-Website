const {Sequelize, DataTypes, Model} = require("sequelize")
const path = require('path')


// Create new database, linked with Sequelize, e.g. const db = new Sequelize("sqlite::memory:")
// You can change the configuration of the database depending if your environment is 'test','production' etc.
process.env.NODE_ENV = 'develop'
const db = process.env.NODE_ENV === 'test'
    ? new Sequelize('sqlite::memory:', null, null, {dialect: 'sqlite', logging:false})
    : new Sequelize({dialect: 'sqlite', storage: path.join(__dirname, 'data.db')})


// Create our classes that extends sequelize.Model
class Restaurant extends Model{}
class Menu extends Model{}
class Item extends Model{}

//Initialise our classes:  Class.init({columns},{table})
//Sequelize deals with foreign keys so you don't explicitly have to state as a field
Restaurant.init({
    name: DataTypes.STRING,
    image: DataTypes.STRING,
}, {sequelize:db})

Menu.init({
    title: DataTypes.STRING,
}, {sequelize:db})

Item.init({
    name: DataTypes.STRING,
    price: DataTypes.FLOAT,
}, {sequelize: db})

Restaurant.hasMany(Menu, {as: "menus"})
Menu.belongsTo(Restaurant)
Menu.hasMany(Item, {as: "items"})
Item.belongsTo(Menu)


module.exports = {Restaurant, Menu, Item, db}