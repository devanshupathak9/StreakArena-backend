const { DataTypes } = require('sequelize');

module.exports = (sequelize) =>
  sequelize.define('Streak', {
    id:               { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    user_id:          { type: DataTypes.INTEGER, allowNull: false },
    group_id:         { type: DataTypes.INTEGER, allowNull: false },
    current_streak:   { type: DataTypes.INTEGER, defaultValue: 0 },
    longest_streak:   { type: DataTypes.INTEGER, defaultValue: 0 },
    last_active_date: { type: DataTypes.DATEONLY, allowNull: true },
  }, {
    tableName: 'streaks',
    underscored: true,
    createdAt: false,
  });
