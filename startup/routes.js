const express = require("express");
const properties = require("../routes/properties");
const tenants = require("../routes/tenants");
const agents = require("../routes/agents");
const rentals = require("../routes/rentals");
const users = require("../routes/users");
const auth = require("../routes/auth");
const home = require("../routes/home");
const morgan = require("morgan");
const winston = require("winston");

module.exports = function (app) {
  // Templating engine
  app.set("view engine", "pug");

  // Express middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(express.static("public"));

  // Morgan
  if (app.get("env") === "development") {
    app.use(morgan("tiny"));
    winston.info("Morgan started...");
  }

  // Routing
  app.use("/api/properties", properties);
  app.use("/api/tenants", tenants);
  app.use("/api/agents", agents);
  app.use("/api/rentals", rentals);
  app.use("/api/users", users);
  app.use("/api/auth", auth);
  app.use("/", home);
};
