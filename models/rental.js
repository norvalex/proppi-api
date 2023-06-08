const mongoose = require("mongoose");
const Joi = require("joi");
const { tenantSchema } = require("./tenant");
const { propertySchema } = require("./property");
const { agentSchema } = require("./agent");

// Schema
const rentalSchema = new mongoose.Schema({
  property: {
    type: propertySchema,
    required: true,
  },
  agent: {
    type: agentSchema,
    required: true,
  },
  tenant: {
    type: tenantSchema,
    required: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  monthlyRentalAmount: {
    type: Number,
    min: 0,
    max: 1000000,
    required: true,
  },
});

// Model
const Rental = mongoose.model("Rental", rentalSchema);

// Validation
function rentalValidation(rental) {
  const schema = Joi.object({
    propertyId: Joi.objectId().required(),
    agentId: Joi.objectId().required(),
    tenantId: Joi.objectId().required(),
    startDate: Joi.date().iso().messages({'date.format': `Date format is YYYY-MM-DD`}).required(),
    endDate: Joi.date().iso().messages({'date.format': `Date format is YYYY-MM-DD`}).required(),
    monthlyRentalAmount: Joi.number().min(0).max(1000000).required(),
    // startDate: Joi.date().format('DD/MM/YYYY'),
  });
  return schema.validate(rental);
}

module.exports.Rental = Rental;
module.exports.rentalValidation = rentalValidation;
