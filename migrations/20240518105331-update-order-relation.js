'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.removeColumn("orders", "item_id", Sequelize.BIGINT)
    await queryInterface.removeColumn("orders", "quantity", Sequelize.INTEGER)

    await queryInterface.addColumn("orders", "total_price", Sequelize.DECIMAL)
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.addColumn("orders", "item_id")
    await queryInterface.addColumn("orders", "quantity")

    await queryInterface.removeColumn("orders", "total_price")
  }
};