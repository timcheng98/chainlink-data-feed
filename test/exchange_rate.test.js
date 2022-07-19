const { sequelize, connect } = require("../src/lib/database");
const ExchangeRateModel = require("../src/models/exchange_rate");
const axios = require("axios");
const moment = require("moment");

beforeAll(async () => {
  await connect();
});

describe("Model", () => {
  describe("Get Data Feed", () => {
    test("get BTC/USD address", async () => {
      const data = await sequelize.models.data_feed.findOne({
        where: {
          from: "BTC",
          to: "USD",
          blockchain: "ethereum",
          provider: "chainlink",
        },
        raw: true,
      });

      expect(data.address).toBe("0xF4030086522a5bEEa4988F8cA5B36dbC97BeE88c");
    });
    test("get ETH/USD address", async () => {
      const data = await sequelize.models.data_feed.findOne({
        where: {
          from: "ETH",
          to: "USD",
          blockchain: "ethereum",
          provider: "chainlink",
        },
        raw: true,
      });

      expect(data.address).toBe("0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419");
    });
    test("get MATIC/ETH address", async () => {
      const data = await sequelize.models.data_feed.findOne({
        where: {
          from: "MATIC",
          to: "ETH",
          blockchain: "ethereum",
          provider: "chainlink",
        },
        raw: true,
      });

      expect(data).toBe(null);
    });
  });

  describe("Get latest price", () => {
    test("get BTC/USD", async () => {
      const data = await ExchangeRateModel.getExchangeRate("BTC", "USD");
      console.log("BTC/USD", data);
    });
    test("get ETH/USD", async () => {
      const data = await ExchangeRateModel.getExchangeRate("ETH", "USD");
      console.log("ETH/USD", data);
    });
    test("Invalid pair ETH/MATIC", async () => {
      try {
        const data = await ExchangeRateModel.getExchangeRate("ETH", "MATIC");
        console.log("ETH/MATIC", data);
      } catch (error) {
        expect(error.code).toBe(-10001);
      }
    });
  });

  describe("Give timestamp price", () => {
    test("get BTC/USD", async () => {
      const data = await ExchangeRateModel.getExchangeRateByTime(
        "BTC",
        "USD",
        moment().unix()
      );
      console.log("BTC/USD", data);
    });
    test("get ETH/USD", async () => {
      const data = await ExchangeRateModel.getExchangeRateByTime(
        "ETH",
        "USD",
        moment().unix()
      );
      console.log("ETH/USD", data);
    });

    test("Invalid pair ETH/MATIC", async () => {
      try {
        const data = await ExchangeRateModel.getExchangeRateByTime(
          "ETH",
          "MATIC",
          moment().unix()
        );
        console.log("ETH/MATIC", data);
      } catch (error) {
        expect(error.code).toBe(-10001);
      }
    });
  });
});

describe("API", () => {
  describe("API /api/exchange_rate/:from/:to", () => {
    test("get BTC/USD", async () => {
      const resp = await axios.get(
        `http://localhost:3000/api/exchange_rate/BTC/USD`
      );
      console.log(resp.data);
      expect(resp.data.status).toBe(1);
    });

    test("Invalid pair MATIC/ETH", async () => {
      const resp = await axios.get(
        `http://localhost:3000/api/exchange_rate/MATIC/ETH`
      );
      console.log(resp.data);
      expect(resp.data.status).toBe(-1);
    });
  });

  describe("API /api/exchange_rate/:from/:to/:given_time", () => {
    test("get BTC/USD", async () => {
      const given_time = moment().startOf('d').unix();
      const resp = await axios.get(
        `http://localhost:3000/api/exchange_rate/BTC/USD/${given_time}`
      );
      console.log(resp.data);
      expect(resp.data.status).toBe(1);
    });

    test("Invalid pair MATIC/ETH", async () => {
      const given_time = moment().startOf('d').unix();
      const resp = await axios.get(
        `http://localhost:3000/api/exchange_rate/MATIC/ETH/${given_time}`
      );
      console.log(resp.data);
      expect(resp.data.status).toBe(-1);
    });
  });

  describe("API /api/exchange_rate/:from/:to/:start/:end", () => {
    test("get BTC/USD", async () => {
      const start = moment().startOf('d').unix();
      const end = moment().unix();
      const resp = await axios.get(
        `http://localhost:3000/api/exchange_rate/BTC/USD/${start}/${end}`);
      console.log(resp.data);
      expect(resp.data.status).toBe(1);
    });

    test("Invalid pair MATIC/ETH", async () => {
      const start = moment().startOf('d').unix();
      const end = moment().unix();
      const resp = await axios.get(
        `http://localhost:3000/api/exchange_rate/MATIC/ETH/${start}/${end}`
      );
      console.log(resp.data);
      expect(resp.data.status).toBe(-1);
    });
  });
});
