const { Sequelize } = require("sequelize");
const config = require("config");
const DB = config.get("DB.MASTER");
const debug = require("debug")("SQL");

exports.sequelize = new Sequelize({
  dialect: "mysql",
  host: DB.HOST,
  username: DB.USERNAME,
  password: DB.PASSWORD,
  database: DB.DATABASE,
  port: 3306,
  pool: { maxConnections: 5, maxIdleTime: 30 },
  language: "en",
  // logging: debug,
  logging: false,
  maxConcurrentQueries: 100,
  logQueryParameters: true,
  timezone: '+00:00'
});

const models = require("../models");
models.setup();

exports.models = this.sequelize.models;

exports.Sequelize = Sequelize;

exports.connect = async () => {
  try {
    await this.sequelize.authenticate();
    debug("Connection has been established successfully.");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
};

exports.sync = async (options = {}) => {
  await this.sequelize.sync(options);
};