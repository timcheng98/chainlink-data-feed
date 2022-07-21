const path = require("path");
require('dotenv').config()
module.exports = {
  DB: {
    MASTER: {
      HOST: process.env.DB_HOST,
      USERNAME: process.env.DB_USERNAME,
      PASSWORD: process.env.DB_PASSWORD,
      DATABASE: "crypto_exchange_rate",
    },
  },
  DIR: {
    MODEL: path.join(__dirname, "..", "src/models"),
  },
  ETH_PROVIDER: process.env.ETH_PROVIDER,
  JOB: {
    ENABLE: Number(process.env.JOB_ENABLE),
  },
};
