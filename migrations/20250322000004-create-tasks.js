'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('tasks', {
      id:          { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      group_id:    { type: Sequelize.INTEGER, allowNull: false, references: { model: 'groups', key: 'id' }, onDelete: 'CASCADE' },
      name:        { type: Sequelize.STRING(100), allowNull: false },
      type:        { type: Sequelize.STRING(20), allowNull: false, defaultValue: 'manual' },
      config:      { type: Sequelize.JSONB, defaultValue: {} },
      is_required: { type: Sequelize.BOOLEAN, defaultValue: true },
      created_at:  { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('tasks');
  },
};
