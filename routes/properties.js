const express = require("express");
const { Property, propertyValidation } = require("../models/property");

const router = express.Router();

router.get("/", async (req, res) => {
  // Only retrieve properties which has not been archived
  // const properties = await Property.find({ archived: { $ne: true } }).sort(
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
  const { error } = propertyValidation(req.body, "post");
  if (error) return res.status(400).send(error.details[0].message);

  const property = new Property({
    erf: req.body.erf,
    addressLine1: req.body.addressLine1,
    addressLine2: req.body.addressLine2,
    city: req.body.city,
    purchaseDate: req.body.purchaseDate,
    purchasePrice: req.body.purchasePrice,
    purchaseFees: req.body.purchaseFees,
  });
  await property.save();

  // TODO: Handle error when trying to POST a duplicate name

  res.send(property);
});

router.put("/:id", async (req, res) => {
  // TODO Authenticate user is logged in
  const { error } = propertyValidation(req.body, "put");
  if (error) return res.status(400).send(error.details[0].message);

  const property = await Property.findByIdAndUpdate(
    req.params.id,
    {
      erf: req.body.erf,
      addressLine1: req.body.addressLine1,
      addressLine2: req.body.addressLine2,
      city: req.body.city,
      purchaseDate: req.body.purchaseDate,
      purchasePrice: req.body.purchasePrice,
      purchaseFees: req.body.purchaseFees,
      saleDate: req.body.saleDate,
      salePrice: req.body.salePrice,
      saleFees: req.body.saleFees,
      archived: req.body.archived,
    },
    { new: true }
  );

  if (!property) return res.status(400).send("Property not found");

  // TODO: Check if current rental date extends beyond saleDate. If it does, then the rentalDate needs updating

  res.send(property);
});

router.delete("/:id", async (req, res) => {
  // TODO Authenticate user is logged in
  // Verify user is admin

  // Only soft delete properties if fullDeleteConfirmed != true, else delete
  const property = await Property.findByIdAndUpdate(
    req.params.id,
    {
      archived: true,
    },
    { new: true }
  );

  if (!property) return res.status(400).send("Property not found");

  res.send(property);
});

module.exports = router;
