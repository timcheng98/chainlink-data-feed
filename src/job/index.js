const config = require("config");
const schedule = require("node-schedule");
const { connect } = require("../lib/database");
const FetchCryptoExchange = require("./fetch-crypto-exchange");

const ENABLE = config.get("JOB.ENABLE");
module.exports = exports = {
  init: async () => {
    await connect();
  },
  start: () => {
    if (!ENABLE) {
      return console.info("JOB DISABLED...");
    }
    // run once when job starts
    console.info(`Job Started ...`);
    FetchCryptoExchange.run();

    // schedule.scheduleJob('*/1 * * * * *', function() {
    // });

    // run every 5 seconds
    // schedule.scheduleJob('*/5 * * * * *', function() {
    // });

    // job every 10 seconds
    // schedule.scheduleJob('*/10 * * * * *', function() {
    // });

    // job every 15 seconds
    schedule.scheduleJob("*/15 * * * * *", function () {});

    // job every minute
    schedule.scheduleJob("00 * * * * *", function () {
      FetchCryptoExchange.run();
      console.log('job every minute')
    });

    // job every 5 minutes
    schedule.scheduleJob("00 */5 * * * *", function () {});

    // job every 15 minutes
    // schedule.scheduleJob('00 */15 * * * *', function() {
    // });

    // hourly job @ xx:05
    // schedule.scheduleJob('00 05 * * * *', function() {});

    // daily job @ 00:15
    // schedule.scheduleJob('00 15 00 * * *', () => {
    // });

    // daily job @ 00:00
    // schedule.scheduleJob('00 * * * * *', function() {
    // });

    // daily job @ 16:00
    // schedule.scheduleJob("0 0 0 * * ?", function () {});

    // daily job @ 00:00
    // schedule.scheduleJob(DailyRefreshRule, function () {});
  },
};
