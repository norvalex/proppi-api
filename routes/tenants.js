const express = require("express");
const { Tenant, validateTenant } = require("../models/tenant");
const router = express.Router();
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const validateObjectId = require("../middleware/validateObjectId");
const validate = require("../middleware/validate");

router.get("/", async (req, res) => {
  const tenants = await Tenant.find().sort("name");

  res.send(tenants);
});

router.get("/:id", validateObjectId, async (req, res) => {
  const tenant = await Tenant.findById(req.params.id);
  if (!tenant) return res.status(404).send("Tenant not found");

  res.send(tenant);
});

router.post("/", [auth, validate(validateTenant, "post")], async (req, res) => {
  const tenant = new Tenant({
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    phone: req.body.phone,
  });
  await tenant.save();

  // TODO: Handle error when trying to POST a duplicate name

  res.send(tenant);
});

router.put(
  "/:id",
  [auth, validateObjectId, validate(validateTenant, "put")],
  async (req, res) => {
    // TODO: what happens if only one parameter is provided
    let tenant = await Tenant.findByIdAndUpdate(
      req.params.id,
      {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        phone: req.body.phone,
      },
      { new: true }
    );

    if (!tenant) return res.status(404).send("Tenant not found");
    // TODO: Handle error when trying to PUT a duplicate name
    res.send(tenant);
  }
);

router.delete("/:id", [auth, admin, validateObjectId], async (req, res) => {
  const tenant = await Tenant.findByIdAndDelete(req.params.id);

  if (!tenant) return res.status(404).send("Tenant not found");

  res.send(tenant);
});

module.exports = router;
