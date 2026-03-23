'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('groups', {
      id:               { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      name:             { type: Sequelize.STRING(100), allowNull: false },
      description:      { type: Sequelize.TEXT, allowNull: true },
      owner_id:         { type: Sequelize.INTEGER, allowNull: false, references: { model: 'users', key: 'id' }, onDelete: 'CASCADE' },
      visibility:       { type: Sequelize.STRING(10), defaultValue: 'public' },
      invite_token:     { type: Sequelize.STRING(100), unique: true },
      invite_expires_at:{ type: Sequelize.DATE, allowNull: true },
      created_at:       { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
    });
    await queryInterface.addIndex('groups', ['owner_id']);
    await queryInterface.addIndex('groups', ['visibility']);
  },
  async down(queryInterface) {
    await queryInterface.dropTable('groups');
  },
};
