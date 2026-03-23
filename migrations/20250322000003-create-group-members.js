'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('group_members', {
      id:       { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      user_id:  { type: Sequelize.INTEGER, allowNull: false, references: { model: 'users', key: 'id' }, onDelete: 'CASCADE' },
      group_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'groups', key: 'id' }, onDelete: 'CASCADE' },
      role:     { type: Sequelize.STRING(10), defaultValue: 'member' },
      joined_at:{ type: Sequelize.DATE, defaultValue: Sequelize.fn('NOW') },
    });
    await queryInterface.addConstraint('group_members', {
      fields: ['user_id', 'group_id'],
      type: 'unique',
      name: 'unique_user_group',
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('group_members');
  },
};
