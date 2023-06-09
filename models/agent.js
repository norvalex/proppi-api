const mongoose = require("mongoose");
const Joi = require("joi");

// Schema
const agentSchema = new mongoose.Schema({
  entityName: {
    type: String,
    required: true,
    minLength: 3,
    maxLength: 255,
  },
  firstName: {
    type: String,
    required: true,
    minLength: 3,
    maxLength: 255,
  },
  lastName: {
    type: String,
    required: true,
    minLength: 3,
    maxLength: 255,
  },
  email: {
    type: String,
    required: true,
    minLength: 3,
    maxLength: 255,
  },
  phone: {
    type: String,
    minLength: 3,
    maxLength: 15,
  },
  logoImage: {
    type: String,
  },
  vatInclManagementFeePercentage: {
    type: Number,
    min: 0,
    max: 1,
    required: true,
  },
});

agentSchema.virtual('name').get(function () {
  return `${this.firstName} ${this.lastName}`;
});


// Model
const Agent = mongoose.model("Agent", agentSchema);

// Validation
function agentValidation(agent) {
  const schema = Joi.object({
    entityName: Joi.string().min(3).max(255).required(),
    firstName: Joi.string().min(3).max(255).required(),
    lastName: Joi.string().min(3).max(255).required(),
    email: Joi.string().min(3).max(255).email().required(),
    phone: Joi.string().min(3).max(15),
    vatInclManagementFeePercentage: Joi.number().min(0).max(1).required(),
  });
  return schema.validate(agent);
}

module.exports.Agent = Agent;
module.exports.agentValidation = agentValidation;
module.exports.agentSchema = agentSchema;
