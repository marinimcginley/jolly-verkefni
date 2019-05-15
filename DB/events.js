const { query, conditionalUpdate } = require('../utils/db');

const xss = require('xss');

const {
  isInt,
  isEmpty,
  isNotEmptyString,
  isString,
  toPositiveNumberOrDefault,
  lengthValidationError,
} = require('../utils/validation');

const {
  validateEventOrDate,
} = require('./validationForDavents');

async function addEventIntoDB(title, description = undefined, startTime, endTime, userId) {
  const event = { title, description, startTime, endTime };
  const errormessage = validateEventOrDate(event, false, userId);

  if (errormessage.length > 0) {
    return {
      fail: true,
      errors: errormessage,
      item: null,
    };
  }

  const cleaneValues = [
    xss(title),
    description? xss(description): null,
    xss(startTime),
    xss(endTime),
    userId,
  ].filter(Boolean);

  console.log("cleaneValues: ");
  console.log(cleaneValues);

  let q;
  if (description) {
    q = `
    INSERT INTO
      events (title, description, startTime, endTime, userId)
    VALUES
      ($1, $2, $3, $4, $5)
    RETURNING *`;
  } else {
    q = `
    INSERT INTO
      events (title, startTime, endTime, userId)
    VALUES
      ($1, $2, $3, $4)
    RETURNING *`;
  }

  const result = await query(q, cleaneValues);

  return {
    fail: false,
    errors: null,
    item: result.rows[0],
  };

}

async function getOneEventFromDB(userId, eventId) {
  const q = `
  SELECT
    * 
  FROM
    events
  WHERE
    id = $1 AND userId = $2`;

  const result = await query(q, [xss(eventId), userId]);

  if (result.rows.length === 0) {
    return {
      success: false,
      item: null,
    };
  }

  return {
    success: true,
    item: result.rows[0],
  };
}

async function patchEventInDB(event, userId) {
  const errormessage = validateEventOrDate(event, true, event.id);
  
  if (errormessage.length > 0) {
    return {
      success: false,
      notFound: false,
      error: errormessage,
      item: null,
    };
  }

  let q = `
  SELECT 
    *
  FROM
    events
  WHERE
    id = $1 AND userId = $2`;

  let result = await query(q, [xss(event.id), userId]);

  if (result.rows.length === 0) {
    return {
      success: false,
      notFound: true,
      error: null,
      item: null,
    };
  }

  if (event.startTime && !event.endTime && (new Date(event.startTime) - new Date(result.rows[0].endtime) > 0) ||
  event.endTime && !event.startTime && (new Date(result.rows[0].starttime) - new Date(event.endTime) > 0)) {
    return {
      success: false,
      notFound: false,
      error: {
        field: 'endTime',
        error: 'endTime cannot come before startTime',
      },
      item: null,
    }
  }

  const cleaneFields = [
    event.title ? 'title' : null,
    event.description ? 'description' : null,
    event.startTime ? 'startTime' : null,
    event.endTime ? 'endTime' : null,
    'userId',
  ];

  const cleaneValues = [
    event.title ? xss(event.title) : null,
    event.description ? xss(event.description) : null,
    event.startTime ? xss(event.startTime) : null,
    event.endTime ? xss(event.endTime) : null,
    userId,
  ];

  result = await conditionalUpdate('events', xss(event.id), cleaneFields, cleaneValues);

  if (result.rows.length === 0) {
    return {
      success: false,
      notFound: true,
      error: null,
      item: null,
    }
  }

  return {
    success: true,
    notFound: true,
    error: null,
    item:  result.rows[0],
  }
}

async function deleteEventFromDB(userId, eventId) {
  let q = `
    SELECT 
      *
    FROM
      events
    WHERE
      id = $1 AND userId = $2`;
  let result = await query(q, [xss(eventId), userId]);

  if (result.rows.length === 0) {
    return {
      success: false,
      notFound: true,
    }
  }

  q = `DELETE FROM 
      events
    WHERE 
    id = $1 AND userId = $2`;

  result = await query(q, [xss(eventId), userId]);

  return {
    success: true,
    notFound: false,
  }
}

module.exports = {
  addEventIntoDB,
  getOneEventFromDB,
  patchEventInDB,
  deleteEventFromDB,
}