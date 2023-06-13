const helmet = require("helmet");
const comression = require("compression");

module.exports = function (app) {
  app.use(helmet());
  app.use(comression());
};
