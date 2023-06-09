const mongoose = require("mongoose");
const Joi = require("joi");

// Schema
const tenantSchema = new mongoose.Schema({
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
});

tenantSchema.virtual('name').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

// Model
const Tenant = mongoose.model("Tenant", tenantSchema);

// Validation
function validateTenant(tenant, requestType) {
  const schema = Joi.object({
    firstName: Joi.string().min(3).max(255).required(),
    lastName: Joi.string().min(3).max(255).required(),
    email: Joi.string().min(3).max(255).email().required(),
    phone: Joi.string().min(3).max(15),
  });
  return schema.validate(tenant);
}

module.exports.Tenant = Tenant;
module.exports.validateTenant = validateTenant;
module.exports.tenantSchema = tenantSchema;
