const { DataTypes } = require('sequelize');

module.exports = (sequelize) =>
  sequelize.define('DailyCompletion', {
    id:           { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    user_id:      { type: DataTypes.INTEGER, allowNull: false },
    task_id:      { type: DataTypes.INTEGER, allowNull: false },
    date:         { type: DataTypes.DATEONLY, allowNull: false },
    status:       { type: DataTypes.STRING(20), defaultValue: 'pending' },
    completed_at: { type: DataTypes.DATE, allowNull: true },
  }, {
    tableName: 'daily_completions',
    underscored: true,
    updatedAt: false,
  });
