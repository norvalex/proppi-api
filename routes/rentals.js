const express = require("express");
const { Rental, rentalValidation } = require("../models/rental");
const { Property } = require("../models/property");
const { Tenant } = require("../models/tenant");
const { Agent } = require("../models/agent");

const router = express.Router();

router.get("/", async (req, res) => {
  const rentals = await Rental.find();

  res.send(rentals);
});

router.post("/", async (req, res) => {
  const { error } = rentalValidation(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const property = await Property.findById(req.body.propertyId);
  if (!property) return res.status(400).send("Property not found");

  const agent = await Agent.findById(req.body.agentId);
  if (!agent) return res.status(400).send("Agent not found");

  const tenant = await Tenant.findById(req.body.tenantId);
  if (!tenant) return res.status(400).send("Tenant not found");

  const rental = new Rental({
    property: property,
    agent: agent,
    tenant: tenant,
    startDate: req.body.startDate,
    endDate: req.body.endDate,
    monthlyRentalAmount: req.body.monthlyRentalAmount,
  });

  await rental.save();

  res.send(rental);
});

module.exports = router;
