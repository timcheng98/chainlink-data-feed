// server.js
const { createServer } = require("http");
const express = require("express");
const app = express();
const session = require("express-session");
const MySQLStore = require("express-mysql-session")(session);

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3000;
const router = require("./routes");
const morgan = require("morgan");
const helmet = require("helmet");
const config = require("config");
const path = require("path");

const mysqlConfig = config.get("DB.MASTER");

/* init Error Code */
const AppError = require("./utils/AppError");
const moment = require("moment");
AppError.setErrorCode(require("./utils/app-error.json"));

exports.start = () => {
  app.use(
    helmet({
      crossOriginEmbedderPolicy: false,
    })
  );
  app.use(morgan("common"));
  app.use(express.urlencoded({ extended: false }));
  app.use(express.json());

  let useMySQLStore =
    mysqlConfig.host &&
    mysqlConfig.password &&
    mysqlConfig.user &&
    mysqlConfig.database;

  if (useMySQLStore) {
    // using MySQL Session Store
    app.use(
      session({
        store: new MySQLStore(mysqlConfig),
        secret: "test",
        resave: true,
        rolling: true,
        saveUninitialized: true,
        cookie: {
          maxAge: 3600,
        },
      })
    );
  } else {
    // using Memory Session Store
    app.use(
      session({
        secret: "test",
        resave: true,
        rolling: true,
        saveUninitialized: true,
        cookie: {
          maxAge: 3600,
        },
      })
    );
  }

  app.get("/version", (req, res) => {
    return res.json({
      version: "1.0.0",
      tx: moment().unix(),
    });
  });

  app.use(router.getRouter());
  const server = createServer(app);
  server.listen(port, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://${hostname}:${port}`);
  });
};
