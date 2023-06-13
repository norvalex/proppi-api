const express = require("express");
const { User, validateUser } = require("../models/user");
const bcrypt = require("bcrypt");
const _ = require("lodash");
const auth = require("../middleware/auth");
const validate = require("../middleware/validate");
const router = express.Router();

// Register new user
router.post("/", validate(validateUser, "post"), async (req, res) => {
  let user = await User.findOne({ email: req.body.email });
  if (user) return res.status(400).send("User already registered");

  user = new User({
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    password: req.body.password,
  });

  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt);

  await user.save();

  const token = user.generateAuthToken();

  res
    .header("x-auth-token", token)
    .send(_.pick(user, ["_id", "firstName", "lastName", "email"]));
});

// Get current user details
router.get("/me", auth, async (req, res) => {
  const users = await User.findById(req.user._id).sort("name");

  res.send(users);
});

module.exports = router;
