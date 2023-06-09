const mongoose = require("mongoose");
const Joi = require("joi");

// Schema
const propertySchema = new mongoose.Schema({
  erf: {
    type: String,
    required: true,
    minLength: 1,
    maxLength: 10,
  },
  addressLine1: {
    type: String,
    required: true,
    minLength: 5,
    maxLength: 255,
  },
  addressLine2: {
    type: String,
    required: true,
    minLength: 5,
    maxLength: 255,
  },
  city: {
    type: String,
    required: true,
    minLength: 5,
    maxLength: 255,
  },
  purchaseDate: {
    type: Date,
    required: true,
  },
  saleDate: {
    type: Date,
  },
});

propertySchema.virtual('name').get(function () {
  return `${this.addressLine2} - Erf ${this.erf} (${this.addressLine1})`;
});

// Model
const Property = mongoose.model("Property", propertySchema);

// Validation
function propertyValidation(property) {
  const schema = Joi.object({
    erf: Joi.string().min(1).max(10).required(),
    addressLine1: Joi.string().min(5).max(255).required(),
    addressLine2: Joi.string().min(5).max(255),
    city: Joi.string().min(5).max(255).required(),
    purchaseDate: Joi.date()
      .iso()
      .messages({ "date.format": `Date format is YYYY-MM-DD` })
      .required(),
  });
  return schema.validate(property);
}

module.exports.Property = Property;
module.exports.propertyValidation = propertyValidation;
module.exports.propertySchema = propertySchema;
