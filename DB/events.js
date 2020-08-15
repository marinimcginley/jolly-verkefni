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
  validateDay,
  validateMonth,
  validateJolly,
  lastDayOfMonth,
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
  if (!isInt(eventId)) {
    return {
      success: false,
      item: null,
    }
  }

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
        field: 'EndTime',
        error: 'EndTime cannot come before startTime',
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

async function getOneDayFromDB(userId, date) {
  const validation = validateDay(date);

  if (validation.length > 0) {
    return {
      success: false,
      error: validation,
      item: null,
    }
  }

  const startTime = `${xss(date.year)}-${xss(date.month)}-${xss(date.day)} 00:00:00`;
  const endTime = `${xss(date.year)}-${xss(date.month)}-${xss(date.day)} 23:59:59`;

  const q = `
    SELECT 
      *
    FROM
      events 
    WHERE 
      ((startTime BETWEEN $1 AND $2 OR endTime BETWEEN $1 AND $2)
      OR 
        (startTime < $1 AND endTime > $2))
    AND userid = $3
    `;
  
  const result = await query(q, [startTime, endTime, userId]);

  return {
    success: true,
    error: null,
    item: result.rows,
  }
}

async function getOneMonthFromDB(date, userId) {
  const validation = validateMonth(date);

  if (validation.length > 0) {
    return {
      success: false,
      error: validation,
      item: null,
    }
  }

  const month = lastDayOfMonth(date.year, date.month);

  const startTime = `${xss(date.year)}-${xss(date.month)}-01 00:00:00`;
  const endTime = `${xss(date.year)}-${xss(date.month)}-${month} 23:59:59`;

  const q = `
    SELECT 
      *
    FROM
      events 
    WHERE 
      ((startTime BETWEEN $1 AND $2 OR endTime BETWEEN $1 AND $2)
      OR 
        (startTime < $1 AND endTime > $2))
    AND userid = $3
    `;
  
  const result = await query(q, [startTime, endTime, userId]);

  return {
    success: true,
    error: null,
    item: result.rows,
  }
}

async function getJollyEventsFromDB(userId, startTime, endTime, ids) {
  const validation = validateJolly(startTime, endTime, ids);

  if (validation.length > 0) {
    return {
      success: false,
      error: validation,
      item: null,
    }
  }

  ids.forEach((id, i, array) => { array[i] = parseInt(xss(id), 10)});

  // tékka ef allir eru vinir
  let condition = `friendId = $2`;
  if (ids.length > 1) {
    for (let i=1; i<ids.length; i++) {
      condition = condition + ` OR friendId = $${i+2}`;
    }
  }

  let q = `
    SELECT
      *
    FROM
      friends
    WHERE userId = $1
      AND (${condition})`;
  
  let values = [userId, ...ids];
  
  const numberOfFriends = await query(q, values);

  if (ids.length > numberOfFriends.rows.length) {
    return {
      success: false,
      error: {
        field: 'Ids',
        error: 'Not all ids are your friends',
      },
      item: null,
    }
  }

  condition = `friendId = $4`;
  if (ids.length > 1) {
    for (let i=1; i<ids.length; i++) {
      condition = condition + ` OR friendId = $${i+4}`;
    }
  }

  // óþarfi að tékka á vinum, búin að gera það! 
  // laga kannski seinna...
  q = `
    SELECT
      * 
    FROM
      events
    WHERE ((startTime BETWEEN $1 AND $2 OR endTime BETWEEN $1 AND $2)
      OR 
        (startTime < $1 AND endTime > $2))
    AND
      (userId = $3 OR userId IN (SELECT 
          friendId
        FROM
          friends
        WHERE
          userId = $3
        AND (${condition}))
      )`;
  
  values = [xss(startTime), xss(endTime), userId, ...ids];

  const result = await query(q, values);

  return {
    success: true,
    error: null,
    item: result.rows,
  }
}

module.exports = {
  addEventIntoDB,
  getOneEventFromDB,
  patchEventInDB,
  deleteEventFromDB,
  getOneDayFromDB,
  getOneMonthFromDB,
  getJollyEventsFromDB,
}