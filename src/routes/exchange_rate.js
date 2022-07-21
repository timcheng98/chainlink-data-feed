const { sequelize } = require("../lib/database");
const moment = require("moment");
const ExchangeRateModel = require("../models/exchange_rate");
const _ = require("lodash");

exports.initRouter = (router) => {
  router.get("/api/exchange_rate/:from/:to", getExchangeRate);
  router.get("/api/exchange_rate/:from/:to/:given_time", getExchangeRateByTime);
  router.get(
    "/api/exchange_rate/:from/:to/:start_time/:end_time",
    getExchangeRateByTimeRange
  );
};

const getExchangeRate = async (req, res) => {
  try {
    const { from, to } = req.params;
    const data = await ExchangeRateModel.getExchangeRate(from, to);
    return res.json({
      status: 1,
      data: {
        rate: data.rate,
        pair: `${from}/${to}`,
        lastest_timestamp: data.timestamp,
        request_timestamp: moment().toISOString(),
      },
    });
  } catch (error) {
    console.error(error);
    console.log(error);
    res.json({
      status: -1,
      errorMessage: error.message,
      errorCode: error.code,
    });
  }
};

const getExchangeRateByTime = async (req, res) => {
  try {
    const { from, to, given_time } = req.params;
    const data = await ExchangeRateModel.getExchangeRateByTime(
      from,
      to,
      _.toInteger(given_time)
    );
    return res.json({
      status: 1,
      data: {
        rate: data.rate,
        pair: `${from}/${to}`,
        nearest_timestamp: data.timestamp,
        request_timestamp: moment.unix(given_time).toISOString(),
      },
    });
  } catch (error) {
    console.error(error);
    res.json({
      status: -1,
      errorMessage: error.message,
      errorCode: error.code,
    });
  }
};

const getExchangeRateByTimeRange = async (req, res) => {
  try {
    const { from, to, start_time, end_time } = req.params;
    const data = await ExchangeRateModel.getExchangeRateByTimeRange(
      from,
      to,
      start_time,
      end_time
    );
    return res.json({
      status: 1,
      data: {
        rate: data.avg_rate,
        pair: `${from}/${to}`,
        start_timestamp: moment.unix(start_time).toISOString(),
        end_timestamp: moment.unix(end_time).toISOString(),
      },
    });
  } catch (error) {
    console.error(error);
    res.json({
      status: -1,
    });
  }
};
