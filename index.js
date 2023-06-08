const express = require("express");
const Joi = require("joi");
Joi.objectId = require("joi-objectid")(Joi);
const debug = require("debug")("app:startup");
const properties = require("./routes/properties");
const tenants = require("./routes/tenants");
const agents = require("./routes/agents");
const rentals = require("./routes/rentals");
const home = require("./routes/home");
const logger = require("./middleware/logger");
const morgan = require("morgan");
const mongoose = require("mongoose");
const config = require('config')
// App
const app = express();

// db Connect
mongoose
  .connect(config.get('dbConnectionString'))
  .then(() => console.log("Connected to MongoDB..."))
  .catch((err) => console.log("Unable to connect to MongoDB..." + err));

// Templating Engines
app.set("view engine", "pug");

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

if (app.get("env") === "development") {
  app.use(morgan("tiny"));
  debug("Morgan started...");
}

// Bespoke middleware
app.use(logger);

// Routing
app.use("/api/properties", properties);
app.use("/api/tenants", tenants);
app.use("/api/agents", agents);
app.use("/api/rentals", rentals);
app.get("/", home);

// Listen
const port = process.env.PORT || 3000;
app.listen(port, () => {
  debug("Listening on port 3000...");
});
