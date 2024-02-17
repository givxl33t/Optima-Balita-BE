'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('nutrition_histories', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4,
      },
      child_id: {
        type: Sequelize.STRING(256),
        allowNull: false,
      },
      child_name: {
        type: Sequelize.STRING(256),
        allowNull: false,
      },
      child_nik: {
        type: Sequelize.STRING(256),
        allowNull: false,
        defaultValue: '3202080504910003',
      },
      child_village: {
        type: Sequelize.STRING(256),
        allowNull: false,
        defaultValue: 'Dukuhseti',
      },
      date_of_birth: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      age_text: {
        type: Sequelize.STRING(256),
        allowNull: false,
      },
      height: {
        type: Sequelize.FLOAT,
        allowNull: false,
      },
      weight: {
        type: Sequelize.FLOAT,
        allowNull: false,
      },
      bmi: {
        type: Sequelize.FLOAT,
        allowNull: false,
      },
      height_category: {
        type: Sequelize.STRING(256),
        defaultValue: 'No Data',
        allowNull: false,
      },
      weight_category: {
        type: Sequelize.STRING(256),
        allowNull: false,
      },
      mass_category: {
        type: Sequelize.STRING(256),
        defaultValue: 'No Data',
        allowNull: false,
      },
      gender: {
        type: Sequelize.STRING(256),
        allowNull: false,
      },
      creator_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      deleted_at: {
        type: Sequelize.DATE,
      },
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('nutrition_histories');
  }
};
