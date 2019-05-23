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
  { title, description, startTime, endTime, ids = null } = {},
  patching = false,
  id = null,
  date = false,
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

  if (date) {
    if (!ids) {
      validations.push({
        field: 'ids',
        error: 'ids cannot be empty',
      })
    }

    if (ids && !ids.every(isInt)) {
      validations.push({
        field: 'ids',
        error: 'ids must contain integers only',
      })
    }
  }

  return validations;
}

function validateDay(date) {
  let { year, month, day } = date;

  const validations = [];
  
  if (!year || !isInt(year)) {
    validations.push({
      field: 'year',
      error: 'year must be an integer',
    });
  }

  if (!month || !isInt(month) || month < 1 || month > 12) {
    validations.push({
      field: 'month',
      error: 'month must be an integer between 1 and 12',
    });
  }

  if (!day || !isInt(day) || day < 1 || day > 31) {
    validations.push({
      field: 'day',
      error: 'day must be an integer between 1 and 31',
    });
  }

  if (month < 10) {
    month = '0' + month;
  }

  if (day < 10) {
    day = '0' + day;
  }

  const newDate = year + '-' + month + '-' + day;

  let options = {};
  options.strict = true;

  if (!isISO8601(newDate, options)) {
    validations.push({
      field: 'date',
      error: 'year, month and day are not a valid ISO 8601 date',
    })
  }

  return validations;
}

function validateMonth(date) {
  const { year, month } = date;

  const validations = [];
  
  if (!year || !isInt(year)) {
    validations.push({
      field: 'year',
      error: 'year must be an integer',
    });
  }

  if (!month || !isInt(month) || month < 1 || month > 12) {
    validations.push({
      field: 'month',
      error: 'month must be an integer between 1 and 12',
    });
  }

  return validations;
}

function validateJolly(startTime, endTime, ids) {
  const validations = [];

  let options = {};
  options.strict = true;

  if (!startTime || !isISO8601(startTime, options)) {
    validations.push({
      field: 'startTime',
      error: 'startTime is not a valid ISO 8601 date',
    })
  }

  if (!endTime || !isISO8601(endTime, options)) {
    validations.push({
      field: 'endTime',
      error: 'endTime is not a valid ISO 8601 date',
    })
  }

  if (!startTime || !endTime || new Date(startTime) - new Date(endTime) > 0) {
    validations.push({
      field: 'endTime',
      error: 'endTime cannot come before startTime',
    });
  }

  if (!ids || ids.length === 0) {
    validations.push({
      field: 'ids',
      error: 'ids must contain at least one integer',
    })
  }

  if (ids) {
    if (!ids.every(isInt)) {
      validations.push({
        field: 'ids',
        error: 'ids must contain integers only',
      })
    }
  }

  return validations;
}

module.exports = {
  validateEventOrDate,
  validateDay,
  validateMonth,
  validateJolly,
}