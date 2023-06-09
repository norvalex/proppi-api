const express = require("express");
const { User, validateUser } = require("../models/user");
const bcrypt = require("bcrypt");
const _ = require("lodash");

const router = express.Router();

router.post("/", async (req, res) => {
  const { error } = validateUser(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let user = await User.findOne({ email: req.body.email });
  if (user) return res.status(400).send("User already registered");

  user = new User({
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    password: req.body.firstName,
  });
  
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt);

  await user.save();

  const token = User().generateAuthToken();

  res
    .header("x-auth-token", token)
    .send(_.pick(user, ["_id", "firstName", "lastName", "email"]));
});

router.get("/me", async (req, res) => {
  const users = await User.find().sort("name");

  res.send(users);
});

module.exports = router;
