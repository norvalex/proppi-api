const mongoose = require("mongoose");
const Joi = require("joi");
const jwt = require("jsonwebtoken");
const config = require("config");

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    minLength: 3,
    maxLength: 50,
    required: true,
  },
  lastName: {
    type: String,
    minLength: 3,
    maxLength: 50,
    required: true,
  },
  email: {
    type: String,
    unique: true,
    required: true,
    minLength: 3,
    maxLength: 255,
  },
  password: {
    type: String,
    required: true,
    minLength: 3,
    maxLength: 1024,
  },
  isAdmin: Boolean,
});

userSchema.virtual("name").get(function () {
  return `${this.firstName} ${this.lastName}`;
});

userSchema.methods.generateAuthToken = function () {
  return jwt.sign(
    { _id: this._id, isAdmin: this.isAdmin },
    config.get("jwtPrivateKey")
  );
};

const User = mongoose.model("User", userSchema);

function validateUser(user) {
  const schema = Joi.object({
    firstName: Joi.string().min(3).max(50).required(),
    lastName: Joi.string().min(3).max(50).required(),
    email: Joi.string().min(3).max(255).required().email(),
    password: Joi.string().min(3).max(255).required(),
  });

  return schema.validate(user);
}

exports.User = User;
exports.validateUser = validateUser;
