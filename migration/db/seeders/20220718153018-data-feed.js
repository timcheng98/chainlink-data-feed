const { data_list } = require("../data/data_feed");

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert("data_feed", data_list);
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete("data_feed", null, {});
  },
};
