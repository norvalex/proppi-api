const express = require("express");
const { Property, propertyValidation } = require("../models/property");

const router = express.Router();

router.get("/", async (req, res) => {
  const properties = await Property.find().sort("name");

  res.send(properties);
});

router.get("/:id", async (req, res) => {
  const property = await Property.findById(req.params.id);
  if (!property) return res.status(400).send("Property not found");

  res.send(property);
});

router.post("/", async (req, res) => {
  // TODO Authenticate user is logged in
  const { error } = propertyValidation(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const property = new Property({
    erf: req.body.erf,
    addressLine1: req.body.addressLine1,
    addressLine2: req.body.addressLine2,
    city: req.body.city,
    purchaseDate: req.body.purchaseDate,
    saleDate: req.body.saleDate,
  });
  property.setName();
  await property.save();

  // TODO: Handle error when trying to POST a duplicate name

  res.send(property);
});

router.put("/:id", async (req, res) => {
  // TODO Authenticate user is logged in
  const { error } = propertyValidation(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  // TODO: what happens if only one parameter is provided
  const property = await Property.findByIdAndUpdate(req.params.id, {
    name: req.body.name,
    startDate: req.body.startDate,
  });

  if (!property) return res.status(400).send("Property not found");
  // TODO: Handle error when trying to PUT a duplicate name
  res.send(property);
});

router.delete("/:id", async (req, res) => {
  // TODO Authenticate user is logged in
  // Verify user is admin
  const property = await Property.findByIdAndDelete(req.params.id);

  if (!property) return res.status(400).send("Property not found");

  res.send(property);
});

module.exports = router;
