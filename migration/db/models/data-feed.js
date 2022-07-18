"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class DataFeed extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  DataFeed.init(
    {
      from: DataTypes.STRING,
      to: DataTypes.STRING,
      address: DataTypes.STRING,
      provider: DataTypes.STRING,
      blockchain: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "data_feed",
      freezeTableName: true,
      underscored: true
    }
  );
  return DataFeed;
};
