'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('daily_completions', {
      id:           { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      user_id:      { type: Sequelize.INTEGER, allowNull: false, references: { model: 'users', key: 'id' }, onDelete: 'CASCADE' },
      task_id:      { type: Sequelize.INTEGER, allowNull: false, references: { model: 'tasks', key: 'id' }, onDelete: 'CASCADE' },
      date:         { type: Sequelize.DATEONLY, allowNull: false },
      status:       { type: Sequelize.STRING(20), defaultValue: 'pending' },
      completed_at: { type: Sequelize.DATE, allowNull: true },
      created_at:   { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
    });
    await queryInterface.addConstraint('daily_completions', {
      fields: ['user_id', 'task_id', 'date'],
      type: 'unique',
      name: 'unique_user_task_date',
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('daily_completions');
  },
};
