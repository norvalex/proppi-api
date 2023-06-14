const express = require("express");
const { Property, validateProperty } = require("../models/property");
const { Rental } = require("../models/rental");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const validateObjectId = require("../middleware/validateObjectId");
const validate = require("../middleware/validate");
const router = express.Router();

router.get("/", async (req, res) => {
  // Only retrieve properties which has not been archived
  const properties = await Property.find({ archived: { $ne: true } }).sort(
    "name"
  );
  // const properties = await Property.find().sort("name");

  res.send(properties);
});

router.get("/:id", validateObjectId, async (req, res) => {
  const property = await Property.findById(req.params.id);
  if (!property) return res.status(404).send("Property not found");

  res.send(property);
});

router.get("/:id/rentals", validateObjectId, async (req, res) => {
  const property = await Property.findById(req.params.id);
  if (!property) return res.status(404).send("Property not found");

  const rentals = await Rental.find({ "property._id": req.params.id });
  res.send(rentals);
});

router.post("/", [auth, validate(validateProperty, "post")], async (req, res) => {
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

router.put(
  "/:id",
  [auth, validateObjectId, validate(validateProperty, "put")],
  async (req, res) => {
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
        archived: req.body.archived
      },
      { new: true }
    );

    if (!property) return res.status(404).send("Property not found");

    // TODO: Check if current rental date extends beyond saleDate. If it does, then the rentalDate needs updating

    res.send(property);
  }
);

router.delete("/:id", [auth, admin, validateObjectId], async (req, res) => {
  // Only soft delete properties if fullDeleteConfirmed != true, else delete
  const property = await Property.findByIdAndDelete(req.params.id);

  if (!property) return res.status(404).send("Property not found");

  res.send(property);
});

module.exports = router;
