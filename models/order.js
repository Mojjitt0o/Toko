'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Order extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsToMany(models.Item, {as: 'items', through: {model: models.OrderItem}, foreignKey: 'item_id'})
      this.hasMany(models.OrderItem, {
        foreignKey: 'order_id',
        as: 'OrderItems'
      });
    }
  }
  Order.init({
    user_id: DataTypes.BIGINT,
    total_price: DataTypes.DECIMAL,
    total_quantity: DataTypes.DECIMAL,
    status: DataTypes.ENUM('pending','success'),
  }, {
    sequelize,
    modelName: 'Order',
    tableName: 'orders',
  });
  return Order;
};