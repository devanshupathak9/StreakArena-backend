'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('users', {
      id:                  { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      username:            { type: Sequelize.STRING(50), allowNull: false, unique: true },
      email:               { type: Sequelize.STRING(255), allowNull: false, unique: true },
      password_hash:       { type: Sequelize.STRING(255), allowNull: false },
      reset_token:         { type: Sequelize.STRING(255), allowNull: true },
      reset_token_expires: { type: Sequelize.DATE, allowNull: true },
      created_at:          { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
      updated_at:          { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('users');
  },
};
