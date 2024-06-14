'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const defaultPasswd = require('bcrypt').hashSync('123456', 10)
    return queryInterface.bulkInsert('users', [
      {
        email: 'janda@ymail.com',
        is_admin: true,
        password: defaultPasswd,
        is_verified: true,
        name: 'JD1',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        email: 'janda2@ymail.com',
        is_admin: true,
        password: defaultPasswd,
        is_verified: true,
        name: 'JD2',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        email: 'janda3@ymail.com',
        is_admin: false,
        password: defaultPasswd,
        is_verified: true,
        name: 'JD3',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        email: 'janda4@ymail.com',
        is_admin: false,
        password: defaultPasswd,
        is_verified: true,
        name: 'JD4',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ])
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('users', null, {});
  }
};