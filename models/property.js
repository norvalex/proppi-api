const mongoose = require("mongoose");
const Joi = require("joi");

// Schema
const propertySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minLength: 5,
    maxLength: 255,
  },
  startDate: {
    type: String,
    minLength: 5,
    maxLength: 255,
    required: true,
  },
  endDate: {
    type: Date,
  },
});

// Model
const Property = mongoose.model("Property", propertySchema);

// Validation
function propertyValidation(property) {
  const schema = Joi.object({
    name: Joi.string().min(5).max(255).required(),
    startDate: Joi.string().min(5).max(255).required(),
  });
  return schema.validate(property);
}

module.exports.Property = Property;
module.exports.propertyValidation = propertyValidation;
module.exports.propertySchema = propertySchema;
