const express = require("express");
const { Agent, validateAgent } = require("../models/agent");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const validateObjectId = require("../middleware/validateObjectId");
const validate = require("../middleware/validate");

const router = express.Router();

router.get("/", async (req, res) => {
  const agents = await Agent.find().sort("name");

  res.send(agents);
});

router.get("/:id", validateObjectId, async (req, res) => {
  const agent = await Agent.findById(req.params.id);
  if (!agent) return res.status(400).send("Agent not found");

  res.send(agent);
});

router.post("/", [auth, validate(validateAgent, "post")], async (req, res) => {
  const agent = new Agent({
    entityName: req.body.entityName,
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    phone: req.body.phone,
    logoImage: req.body.logoImage,
    vatInclManagementFeePercentage: req.body.vatInclManagementFeePercentage,
  });
  await agent.save();

  // TODO: Handle error when trying to POST a duplicate name

  res.send(agent);
});

router.put(
  "/:id",
  [auth, validateObjectId, validate(validateAgent, "put")],
  async (req, res) => {
    // TODO: what happens if only one parameter is provided
    const agent = await Agent.findByIdAndUpdate(
      req.params.id,
      {
        entityName: req.body.entityName,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        phone: req.body.phone,
        logoImage: req.body.logoImage,
        vatInclManagementFeePercentage: req.body.vatInclManagementFeePercentage,
      },
      { new: true }
    );

    if (!agent) return res.status(400).send("Agent not found");
    // TODO: Handle error when trying to PUT a duplicate name
    res.send(agent);
  }
);

router.delete("/:id", [auth, admin, validateObjectId], async (req, res) => {
  const agent = await Agent.findByIdAndDelete(req.params.id);

  if (!agent) return res.status(400).send("Agent not found");

  res.send(agent);
});

module.exports = router;
