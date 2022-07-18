const path = require("path");

module.exports = {
  DB: {
    MASTER: {
      HOST: "127.0.0.1",
      USERNAME: "root",
      PASSWORD: null,
      DATABASE: "crpyto_exchange_rate",
    },
  },
  DIR: {
    MODEL: path.join(__dirname, "..", "src/models"),
  },
  ETH_PROVIDER: "",
  JOB: {
    ENABLE: false,
  },
};
