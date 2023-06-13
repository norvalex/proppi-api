const express = require("express");
const Joi = require("joi");
const { User } = require("../models/user");
const bcrypt = require("bcrypt");
const validate = require("../middleware/validate");
const router = express.Router();

// User login
router.post("/", validate(validateAuth, "post"), async (req, res) => {

  let user = await User.findOne({ email: req.body.email });
  if (!user) return res.status(400).send("Invalid email or password");

  const validPassword = await bcrypt.compare(req.body.password, user.password);
  if (!validPassword) return res.status(400).send("Invalid email or password");

  const token = user.generateAuthToken();

  res.send(token);
});

function validateAuth(req, requestType) {
  const schema = Joi.object({
    email: Joi.string().min(3).max(255).required().email(),
    password: Joi.string().min(3).max(255).required(),
  });

  return schema.validate(req);
}

module.exports = router;
