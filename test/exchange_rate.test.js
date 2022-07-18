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

      expect(data.address).toBe("0xf4030086522a5beea4988f8ca5b36dbc97bee88c");
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

      expect(data.address).toBe("0x5f4ec3df9cbd43714fe2740f5e3616155c5b8419");
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

    test("get DAI/ETH", async () => {
      const resp = await axios.get(
        `http://localhost:3000/api/exchange_rate/DAI/ETH`
      );
      console.log(resp.data);
      expect(resp.data.status).toBe(1);
    });

    test("get MATIC/USD", async () => {
      const resp = await axios.get(
        `http://localhost:3000/api/exchange_rate/MATIC/USD`
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
      const now = moment().unix();
      const resp = await axios.get(
        `http://localhost:3000/api/exchange_rate/BTC/USD/${now}`
      );
      console.log(resp.data);
      expect(resp.data.status).toBe(1);
    });

    test("get DAI/ETH", async () => {
      const now = moment().unix();
      const resp = await axios.get(
        `http://localhost:3000/api/exchange_rate/DAI/ETH/${now}`
      );
      console.log(resp.data);
      expect(resp.data.status).toBe(1);
    });

    test("get MATIC/USD", async () => {
      const now = moment().unix();
      const resp = await axios.get(
        `http://localhost:3000/api/exchange_rate/MATIC/USD/${now}`
      );
      console.log(resp.data);
      expect(resp.data.status).toBe(1);
    });
    test("Invalid pair MATIC/ETH", async () => {
      const now = moment().unix();
      const resp = await axios.get(
        `http://localhost:3000/api/exchange_rate/MATIC/ETH/${now}`
      );
      console.log(resp.data);
      expect(resp.data.status).toBe(-1);
    });
  });
});
