const Module = (module.exports = exports = {});

const fs = require("fs");
const path = require("path");
const _ = require("lodash");
const { sequelize } = require("../lib/database");
const { models } = sequelize;

const config = require("config");

const dir = fs.readdirSync(config.get("DIR.MODEL"));

_.map(dir, (filename) => {
  const file = path.parse(filename);
  if (file.ext !== ".js" || file.name === "index") return;
  Module[file.name] = require("./" + file.name);
});

exports.setup = async () => {
  getAssociate();
  console.log(models);
  return models;
};

const getAssociate = () => {
  const relationship = getRelationship();
  _.map(relationship, (call) => {
    call();
  });
};

const getRelationship = () => {
  return {
    // EXAMPLE
    // example: () => {
    //   models.example.belongsToMany();
    //   models.example.belongsTo();
    // },
    coin_rate: () => {},
  };
};
