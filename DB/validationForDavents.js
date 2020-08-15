const {
  isInt,
  isEmpty,
  isNotEmptyString,
  isString,
  toPositiveNumberOrDefault,
  lengthValidationError,
} = require('../utils/validation');

const isISO8601 = require('validator/lib/isISO8601');

function lastDayOfMonth(year, month) {
  if (month == 1 || month == 3 || month == 5
    || month == 7|| month == 8|| month == 10
    || month == 12) {
    return 31;
  } else if (month == 2 && year%4 == 0) {
    return 29;
  } else if (month == 2 && year%4 == 1) {
    return 28;
  } else return 30;
}

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
        field: 'Title',
        error: lengthValidationError(1, 64),
      });
    }
  }

  if (description) {
    if (!isNotEmptyString(description, { min: 1, max: 128})) {
      validations.push({
        file: 'Description',
        error: lengthValidationError(1,128),
      });
    }
  }

  let options = {};
  options.strict = true;

  if (!patching || startTime || isString(startTime)) {
    if (!startTime || !isISO8601(startTime, options)) {
      validations.push({
        field: 'StartTime',
        error: 'StartTime must be on ISO 8601 standard',  
      });
    }
  }

  if (!patching || endTime || isString(endTime, options)) {
    if (!endTime || !isISO8601(endTime)) {
      validations.push({
        field: 'EndTime',
        error: 'EndTime must be on ISO 8601 standard',  
      });
    }
  }

  if (startTime && endTime) {
    if (new Date(startTime) - new Date(endTime) > 0) {
      validations.push({
        field: 'EndTime',
        error: 'EndTime cannot come before startTime',
      });
    }
  }

  if (patching) {
    if (!isInt(id)) {
      validations.push({
        field: 'Id',
        error: 'Id must be an integer',
      })
    }
  }

  if (date) {
    if (!ids) {
      validations.push({
        field: 'Ids',
        error: 'Ids cannot be empty',
      })
    }

    if (ids && !ids.every(isInt)) {
      validations.push({
        field: 'Ids',
        error: 'Ids must contain integers only',
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
      field: 'Year',
      error: 'Year must be an integer',
    });
  }

  if (!month || !isInt(month) || month < 1 || month > 12) {
    validations.push({
      field: 'Month',
      error: 'Month must be an integer between 1 and 12',
    });
  }

  if (!day || !isInt(day) || day < 1 || day > 31) {
    validations.push({
      field: 'Day',
      error: 'Day must be an integer between 1 and 31',
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
      field: 'Date',
      error: 'Year, month and day are not a valid ISO 8601 date',
    })
  }

  return validations;
}

function validateMonth(date) {
  const { year, month } = date;

  const validations = [];
  
  if (!year || !isInt(year)) {
    validations.push({
      field: 'Year',
      error: 'Year must be an integer',
    });
  }

  if (!month || !isInt(month) || month < 1 || month > 12) {
    validations.push({
      field: 'Month',
      error: 'Month must be an integer between 1 and 12',
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
      field: 'StartTime',
      error: 'StartTime is not a valid ISO 8601 date',
    })
  }

  if (!endTime || !isISO8601(endTime, options)) {
    validations.push({
      field: 'EndTime',
      error: 'EndTime is not a valid ISO 8601 date',
    })
  }

  if (!startTime || !endTime || new Date(startTime) - new Date(endTime) > 0) {
    validations.push({
      field: 'EndTime',
      error: 'EndTime cannot come before startTime',
    });
  }

  if (!ids || ids.length === 0) {
    validations.push({
      field: 'Ids',
      error: 'Ids must contain at least one integer',
    })
  }

  if (ids) {
    if (!ids.every(isInt)) {
      validations.push({
        field: 'Ids',
        error: 'Ids must contain integers only',
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
  lastDayOfMonth,
}