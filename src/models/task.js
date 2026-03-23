const { DataTypes } = require('sequelize');

module.exports = (sequelize) =>
  sequelize.define('Task', {
    id:          { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    group_id:    { type: DataTypes.INTEGER, allowNull: false },
    name:        { type: DataTypes.STRING(100), allowNull: false },
    type:        { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'manual' },
    config:      { type: DataTypes.JSONB, defaultValue: {} },
    is_required: { type: DataTypes.BOOLEAN, defaultValue: true },
  }, {
    tableName: 'tasks',
    underscored: true,
    updatedAt: false,
  });
