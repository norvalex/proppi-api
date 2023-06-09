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
  purchasePrice: {
    type: Number,
    min: 0,
  },
  purchaseFees: {
    type: Number,
    min: 0,
  },
  saleDate: {
    type: Date,
  },
  salePrice: {
    type: Number,
    min: 0,
  },
  saleFees: {
    type: Number,
    min: 0,
  },
  archived: {
    type: Boolean,
    default: false,
  },
});

propertySchema.virtual("name").get(function () {
  return `${this.addressLine2} - Erf ${this.erf} (${this.addressLine1})`;
});

// Model
const Property = mongoose.model("Property", propertySchema);

// Validation
function propertyValidation(property, requestType) {
  const schema = Joi.object({
    erf: Joi.string().min(1).max(10).required(),
    addressLine1: Joi.string().min(5).max(255).required(),
    addressLine2: Joi.string().min(5).max(255),
    city: Joi.string().min(5).max(255).required(),
    purchaseDate: Joi.date()
      .iso()
      .messages({ "date.format": `Date format is YYYY-MM-DD` })
      .required(),
    purchasePrice: Joi.number().min(0),
    purchaseFees: Joi.number().min(0),

    // Not allowed to add sales details on POST.
    saleDate: Joi.date()
      .iso()
      .min(Joi.ref("purchaseDate"))
      .messages({ "date.format": `Date format is YYYY-MM-DD` })
      .alter({
        post: (schema) => schema.forbidden(),
      }),
    salePricePrice: Joi.number()
      .min(0)
      .alter({
        post: (schema) => schema.forbidden(),
      }),
    saleFees: Joi.number()
      .min(0)
      .alter({
        post: (schema) => schema.forbidden(),
      }),

    // Not allowed to archive a record on POST.
    archived: Joi.boolean().alter({
      post: (schema) => schema.forbidden(),
    }),
  });

  return schema.tailor(requestType).validate(property);
}

module.exports.Property = Property;
module.exports.propertyValidation = propertyValidation;
module.exports.propertySchema = propertySchema;
