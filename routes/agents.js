const express = require("express");
const { Agent, agentValidation } = require("../models/agent");

const router = express.Router();

router.get("/", async (req, res) => {
  const agents = await Agent.find().sort("name");

  res.send(agents);
});

router.get("/:id", async (req, res) => {
  const agent = await Agent.findById(req.params.id);
  if (!agent) return res.status(400).send("Agent not found");

  res.send(agent);
});

router.post("/", async (req, res) => {
  // TODO Authenticate user is logged in
  const { error } = agentValidation(req.body);
  if (error) return res.status(400).send(error.details[0].message);

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

router.put("/:id", async (req, res) => {
  // TODO Authenticate user is logged in
  const { error } = agentValidation(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  // TODO: what happens if only one parameter is provided
  const agent = await Agent.findByIdAndUpdate(req.params.id, {
    entityName: req.body.entityName,
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    phone: req.body.phone,
    logoImage: req.body.logoImage,
    vatInclManagementFeePercentage: req.body.vatInclManagementFeePercentage,
  });

  if (!agent) return res.status(400).send("Agent not found");
  // TODO: Handle error when trying to PUT a duplicate name
  res.send(agent);
});

router.delete("/:id", async (req, res) => {
  // TODO Authenticate user is logged in
  // Verify user is admin
  const agent = await Agent.findByIdAndDelete(req.params.id);

  if (!agent) return res.status(400).send("Agent not found");

  res.send(agent);
});

module.exports = router;
