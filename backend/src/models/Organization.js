const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Organization = sequelize.define(
  "Organization",
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(120),
      allowNull: false,
    },
    defaultLowStockThreshold: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 5,
      validate: {
        min: 0,
      },
    },
  },
  {
    tableName: "organizations",
  }
);

module.exports = Organization;
