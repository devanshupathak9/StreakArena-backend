const { DataTypes } = require('sequelize');

module.exports = (sequelize) =>
  sequelize.define('User', {
    id:                   { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    username:             { type: DataTypes.STRING(50), allowNull: false, unique: true },
    email:                { type: DataTypes.STRING(255), allowNull: false, unique: true },
    password_hash:        { type: DataTypes.STRING(255), allowNull: false },
    reset_token:          { type: DataTypes.STRING(255), allowNull: true },
    reset_token_expires:  { type: DataTypes.DATE, allowNull: true },
  }, {
    tableName: 'users',
    underscored: true,
  });
