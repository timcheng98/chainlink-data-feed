const { DataTypes } = require("sequelize");
const { sequelize } = require("../lib/database");
const { Op } = require("sequelize");
const moment = require("moment");
const chainlinkModel = require("./chainlink");

const _ = require("lodash");
const Model = sequelize.define(
  "exchange_rate",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    from: DataTypes.STRING,
    to: DataTypes.STRING,
    rate: DataTypes.DOUBLE,
    phase_id: DataTypes.INTEGER,
    aggregator_round_id: DataTypes.BIGINT,
    timestamp: {
      type: "TIMESTAMP",
    },
  },
  { freezeTableName: true, underscored: true }
);

exports.findOrCreate = async ({ from, to, rate, round_id, timestamp }) => {
  await sequelize.models.exchange_rate.findOrCreate({
    where: {
      from,
      to,
      timestamp,
    },
    defaults: {
      from,
      to,
      timestamp,
      rate,
      round_id,
    },
    raw: true,
  });
};

exports.getExchangeRate = async (from, to) => {
  const data = await sequelize.models.exchange_rate.findOne({
    where: {
      from,
      to,
      timestamp: moment().toISOString(),
    },
    order: [["created_at", "DESC"]],
    raw: true,
  });

  if (!data) {
    const dataFeed = await chainlinkModel.getPriceFeed(from, to);
    return dataFeed;
  }

  return data;
};

exports.getExchangeRateByTime = async (from, to, given_time) => {
  const data = await sequelize.models.exchange_rate.findOne({
    where: {
      from,
      to,
      timestamp: {
        [Op.gte]: moment.unix(given_time).toISOString(),
      },
    },
    order: [["timestamp", "ASC"]],
    raw: true,
  });

  if (!data) {
    console.log("  no cache data from db    ");
    const dataFeed = await chainlinkModel.getTargetPriceFeed({
      from,
      to,
      given_time,
    });

    return dataFeed;
  }

  if (moment(data.timestamp).unix() !== _.toInteger(given_time)) {
    console.log("  have cache data from db    ");
    const dataFeed = await chainlinkModel.getTargetPriceFeed({
      from,
      to,
      given_time,
      round_id: chainlinkModel.getRoundId(
        data.phase_id,
        data.aggregator_round_id
      ),
    });
    return dataFeed;
  }

  return data;
};

exports.getExchangeRateByTimeRange = async (from, to, start_time, end_time) => {
  const data = await sequelize.models.exchange_rate.findOne({
    where: {
      from,
      to,
      timestamp: {
        [Op.gte]: moment.unix(end_time).toISOString(),
      },
    },
    order: [["timestamp", "ASC"]],
    raw: true,
  });

  if (!data) {
    console.log("  no cache data from db    ");
    const dataFeed = await chainlinkModel.getTargetPriceFeed({
      from,
      to,
      given_time: start_time,
    });
  } else {
    console.log("  have cache data from db    ");
    const dataFeed = await chainlinkModel.getTargetPriceFeed({
      from,
      to,
      given_time: start_time,
      round_id: chainlinkModel.getRoundId(
        data.phase_id,
        data.aggregator_round_id
      ),
    });
  }

  const [result] = await sequelize.models.exchange_rate.findAll({
    where: {
      from,
      to,
      timestamp: {
        [Op.between]: [
          moment.unix(start_time).toISOString(),
          moment.unix(end_time).toISOString(),
        ],
      },
    },
    attributes: [
      [sequelize.fn("AVG", sequelize.col("rate")), "avg_rate"],
      "rate",
      "from",
      "to",
      "timestamp",
    ],
    raw: true,
    limit: 1
  });


  return result;
};
