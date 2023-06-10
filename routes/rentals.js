const express = require("express");
const { Rental, rentalValidation } = require("../models/rental");
const { Property } = require("../models/property");
const { Tenant } = require("../models/tenant");
const { Agent } = require("../models/agent");
const _ = require("lodash");

const router = express.Router();

router.get("/", async (req, res) => {
  const rentals = await Rental.find();

  res.send(rentals);
});

router.get("/:id", async (req, res) => {
  const rental = Rental.findById(req.params.id);

  if (!rental) return res.status(400).send("Rental not found");

  res.send(rental);
});

router.post("/", async (req, res) => {
  const { error } = rentalValidation(req.body, "post");
  if (error) return res.status(400).send(error.details[0].message);

  const property = await Property.findOne({
    _id: req.body.propertyId,
    archived: { $ne: true },
  });
  if (!property) return res.status(400).send("Property not found");

  const agent = await Agent.findById(req.body.agentId);
  if (!agent) return res.status(400).send("Agent not found");

  const tenant = await Tenant.findById(req.body.tenantId);
  if (!tenant) return res.status(400).send("Tenant not found");

  const rental = new Rental({
    property: {
      _id: property._id,
      name: property.name,
    },
    agent: {
      _id: agent._id,
      entityName: agent.entityName,
      name: agent.name,
      email: agent.email,
      phone: agent.phone,
      vatInclManagementFeePercentage: agent.vatInclManagementFeePercentage,
    },
    tenant: {
      _id: tenant._id,
      name: tenant.name,
    },
    startDate: req.body.startDate,
    endDate: req.body.endDate,
    monthlyRentalAmount: req.body.monthlyRentalAmount,
  });

  await rental.save();

  res.send(rental);
});

router.put("/:id", async (req, res) => {
  const { error } = rentalValidation(req.body, "put");
  if (error) return res.status(400).send(error.details[0].message);

  const rental = await Rental.findByIdAndUpdate(
    req.params.id,
    {
      startDate: req.body.startDate,
      endDate: req.body.endDate,
      monthlyRentalAmount: req.body.monthlyRentalAmount,
    },
    { new: true }
  );

  if (!rental) return res.status(400).send("Rental not found");

  res.send(rental);
});

router.delete("/:id", async (req, res) => {
  const rental = await Rental.findByIdAndDelete(req.params.id);

  if (!rental) return res.status(400).send("Rental not found");

  res.send(rental);
});

module.exports = router;
