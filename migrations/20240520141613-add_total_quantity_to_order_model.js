'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('orders', 'total_quantity', {
      type: Sequelize.INTEGER
    });
},

async down (queryInterface, Sequelize) {
  await queryInterface.removeColumn('orders', 'total_quantity');
}
};
