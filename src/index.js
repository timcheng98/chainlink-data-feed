require("dotenv").config();

const db = require("./lib/database");
const server = require("./server");
const job = require("./job");

const main = async () => {
  await db.connect();
  await db.sync({ alter: true });
  await server.start();
  job.init()
  job.start()
};

main();
