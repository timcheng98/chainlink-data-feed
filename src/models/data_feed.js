const { DataTypes } = require("sequelize");
const { sequelize } = require("../lib/database");

const Model = sequelize.define(
  "data_feed",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    provider: DataTypes.STRING,
    from: DataTypes.STRING,
    to: DataTypes.STRING,
    blockchain: DataTypes.STRING,
    address: DataTypes.STRING,
  },
  { freezeTableName: true, underscored: true }
);
