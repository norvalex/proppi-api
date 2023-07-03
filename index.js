const express = require("express");
const winston = require("winston");

const app = express();

require("./startup/logging")();
require("./startup/db")();
require("./startup/validation")();
require("./startup/prod")(app);
require("./startup/cors")();
require("./startup/routes")(app);

const port = process.env.PORT || 3000;
module.exports = app.listen(port, () => {
  winston.info("Listening on port 3000...");
});