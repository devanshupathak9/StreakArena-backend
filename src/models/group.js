const { DataTypes } = require('sequelize');

module.exports = (sequelize) =>
  sequelize.define('Group', {
    id:               { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name:             { type: DataTypes.STRING(100), allowNull: false },
    description:      { type: DataTypes.TEXT, allowNull: true },
    owner_id:         { type: DataTypes.INTEGER, allowNull: false },
    visibility:       { type: DataTypes.STRING(10), defaultValue: 'public' },
    invite_token:     { type: DataTypes.STRING(100), unique: true },
    invite_expires_at:{ type: DataTypes.DATE, allowNull: true },
  }, {
    tableName: 'groups',
    underscored: true,
    updatedAt: false,
  });
