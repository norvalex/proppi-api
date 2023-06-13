const mongoose = require("mongoose");
const Joi = require("joi");
const moment = require("moment");

// Schema
const schemaOptions = {
  toObject: {
    virtuals: true,
  },
  toJSON: {
    virtuals: true,
  },
};

const rentalSchema = new mongoose.Schema(
  {
    property: {
      type: new mongoose.Schema({
        _id: {
          type: String,
        },
        name: {
          type: String,
        },
      }),
      required: true,
    },
    agent: {
      type: new mongoose.Schema({
        _id: {
          type: String,
        },
        entityName: {
          type: String,
        },
        name: {
          type: String,
        },
        email: {
          type: String,
        },
        phone: {
          type: String,
        },
        vatInclManagementFeePercentage: {
          type: String,
        },
      }),
      required: true,
    },
    tenant: {
      type: new mongoose.Schema({
        _id: {
          type: String,
        },
        name: {
          type: String,
        },
      }),
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
  },
  schemaOptions
);

rentalSchema.virtual("duration").get(function () {
  return moment(this.endDate)
    .add(1, "days")
    .diff(moment(this.startDate), "months", true);
});

rentalSchema.virtual("isActive").get(function () {
  const now = moment();
  if (moment(this.startDate) < now && moment(this.endDate).add(1, "days") > now)
    return true;
  else return false;
});

// Model
const Rental = mongoose.model("Rental", rentalSchema);

// Validation
function validateRental(rental, requestType) {
  const schema = Joi.object({
    propertyId: Joi.objectId().alter({
      post: (schema) => schema.required(),
      put: (schema) => schema.forbidden(),
    }),
    agentId: Joi.objectId().alter({
      post: (schema) => schema.required(),
      put: (schema) => schema.forbidden(),
    }),
    tenantId: Joi.objectId().alter({
      post: (schema) => schema.required(),
      put: (schema) => schema.forbidden(),
    }),
    startDate: Joi.date()
      .iso()
      .messages({ "date.format": `Date format is YYYY-MM-DD` })
      .required(),
    endDate: Joi.date()
      .iso()
      .messages({ "date.format": `Date format is YYYY-MM-DD` })
      .required()
      .min(Joi.ref("startDate")),
    monthlyRentalAmount: Joi.number().min(0).max(1000000).required(),
  });
  return schema.tailor(requestType).validate(rental);
}

module.exports.Rental = Rental;
module.exports.validateRental = validateRental;
