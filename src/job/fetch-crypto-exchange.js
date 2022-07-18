const { DataTypes } = require("sequelize");
const { sequelize } = require("../lib/database");
const { Op } = require("sequelize");
const moment = require("moment");
const chainlinkModel = require("../models/chainlink");
const _ = require("lodash");

exports.run = async () => {
  const dataFeed = await sequelize.models.data_feed.findAll();
  const pm = _.map(dataFeed, (item) => {
    return chainlinkModel.updatedDataFeed(item.address, item.from, item.to);
  });
  await Promise.all(pm);
};
