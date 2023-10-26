'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('roles', [
      {
        id: process.env.ADMIN_ID,
        name: 'ADMIN',
      },
      {
        id: process.env.DOCTOR_ID,
        name: 'DOCTOR',
      },
      {
        id: process.env.GUEST_ID,
        name: 'GUEST',
      },
    ])
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('roles', null, {});
  }
};
