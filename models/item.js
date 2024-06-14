'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Item extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
        this.belongsToMany(models.Order, {
          as: 'orders', 
          through: {model: models.OrderItem}, 
          foreignKey: 'order_id'})
        this.hasMany(models.OrderItem, {
          foreignKey: 'item_id',
          as: 'OrderItems'
        });
    }
  }
  Item.init({
    name: DataTypes.STRING,
    description: DataTypes.STRING,
    image: DataTypes.STRING,
    stock: DataTypes.INTEGER,
    price: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Item',
    tableName: 'items',
  });
  return Item;
};