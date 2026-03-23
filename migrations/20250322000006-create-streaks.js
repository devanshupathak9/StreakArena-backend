'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('streaks', {
      id:               { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      user_id:          { type: Sequelize.INTEGER, allowNull: false, references: { model: 'users', key: 'id' }, onDelete: 'CASCADE' },
      group_id:         { type: Sequelize.INTEGER, allowNull: false, references: { model: 'groups', key: 'id' }, onDelete: 'CASCADE' },
      current_streak:   { type: Sequelize.INTEGER, defaultValue: 0 },
      longest_streak:   { type: Sequelize.INTEGER, defaultValue: 0 },
      last_active_date: { type: Sequelize.DATEONLY, allowNull: true },
      updated_at:       { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
    });
    await queryInterface.addConstraint('streaks', {
      fields: ['user_id', 'group_id'],
      type: 'unique',
      name: 'unique_user_group_streak',
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('streaks');
  },
};
