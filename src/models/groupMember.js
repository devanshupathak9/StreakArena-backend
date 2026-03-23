const { DataTypes } = require('sequelize');

module.exports = (sequelize) =>
  sequelize.define('GroupMember', {
    id:       { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    user_id:  { type: DataTypes.INTEGER, allowNull: false },
    group_id: { type: DataTypes.INTEGER, allowNull: false },
    role:     { type: DataTypes.STRING(10), defaultValue: 'member' },
    joined_at:{ type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  }, {
    tableName: 'group_members',
    underscored: true,
    timestamps: false,
  });
