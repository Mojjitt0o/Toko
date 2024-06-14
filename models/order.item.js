'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class OrderItem extends Model {

        static associate(models) {
            this.belongsTo(models.Order, {
              foreignKey: 'order_id',
              as: 'Order'
            });

          this.belongsTo(models.Item, {
              foreignKey: 'item_id',
              as: 'Item'
           });
        }
    }
    OrderItem.init({
        order_id: DataTypes.INTEGER,
        item_id: DataTypes.INTEGER,
        quantity: DataTypes.DECIMAL
      }, {
        sequelize,
        modelName: 'OrderItem',
        tableName: 'order_items',
      });
      return OrderItem;
}