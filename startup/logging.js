const winston = require("winston");
require('express-async-errors')

module.exports = function () {
  winston.handleExceptions(
    new winston.transports.Console({ colorize: true, prettyPrint: true }),
    new winston.transports.File({ filename: "uncaughtExceptions.log" })
  );

  process.on("unhandledRejection", (ex) => {
    throw ex;
  });

  winston.add(winston.transports.File, {
    filename: "logfile.log",
    level: "warn",
  });
  // winston.add(winston.transports.MongoDB, {
  //   db: "mongodb://127.0.0.1/vidly",
  //   level: "warn",
  // });
};
