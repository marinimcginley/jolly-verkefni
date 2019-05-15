const {
  isInt,
  isEmpty,
  isNotEmptyString,
  isString,
  toPositiveNumberOrDefault,
  lengthValidationError,
} = require('../utils/validation');

const isISO8601 = require('validator/lib/isISO8601');

function validateEventOrDate(
  { title, description, startTime, endTime } = {},
  patching = false,
  id = null,
) {

  const validations = [];

  if (!patching || title || isString(title)) {
    if (!isNotEmptyString(title, { min: 1, max: 64 })) {
      validations.push({
        field: 'title',
        error: lengthValidationError(1, 64),
      });
    }
  }

  if (description) {
    if (!isNotEmptyString(description, { min: 1, max: 128})) {
      validations.push({
        file: 'description',
        error: lengthValidationError(1,128),
      });
    }
  }

  let options = {};
  options.strict = true;

  console.log("isEmpty(startTime)");
  console.log(isEmpty(startTime));
  console.log(!startTime);

  if (!patching || startTime || isString(startTime)) {
    if (!startTime || !isISO8601(startTime, options)) {
      validations.push({
        field: 'startTime',
        error: 'startTime must be on ISO 8601 standard',  
      });
    }
  }

  if (!patching || endTime || isString(endTime, options)) {
    if (!endTime || !isISO8601(endTime)) {
      validations.push({
        field: 'endTime',
        error: 'endTime must be on ISO 8601 standard',  
      });
    }
  }

  if (startTime && endTime) {
    if (new Date(startTime) - new Date(endTime) > 0) {
      validations.push({
        field: 'endTime',
        error: 'endTime cannot come before startTime',
      });
    }
  }

  if (patching) {
    if (!isInt(id)) {
      validations.push({
        field: 'id',
        error: 'id must be an integer',
      })
    }
  }

  return validations;
}

module.exports = {
  validateEventOrDate,
}