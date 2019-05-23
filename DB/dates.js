const xss = require('xss');

const { query } = require('../utils/db');

const { 
  validateEventOrDate,
  validateDay,
  validateMonth,
} = require('./validationForDavents');

const {
  isInt,
  isEmpty,
  isNotEmptyString,
  isString,
  toPositiveNumberOrDefault,
  lengthValidationError,
} = require('../utils/validation');

async function addDateToDB(userId, title, description, startTime, endTime, ids) {
  const validation = validateEventOrDate({ title, description, startTime, endTime, ids }, false, null, true);

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
        field: 'ids',
        error: 'not all ids are your friends',
      },
      item: null,
    }
  }

  condition = `($5, (SELECT id FROM dates))`;
  if (values.length > 1) {
    for (let i=1; i<values.length; i++) {
      condition = condition + `, ($${i+5}, (SELECT id FROM dates))`;
    }
  }

  q = `
    WITH dates AS (
      INSERT INTO 
        dates (title, description, startTime, endTime)
      VALUES 
        ($1, $2, $3, $4)
      RETURNING id, title, description, startTime, endTime
    )
    INSERT INTO 
      userdates (userId, dateId)
    VALUES
      ${condition}
    RETURNING *
    `;
  
  const result = await query(q, [xss(title), xss(description), xss(startTime), xss(endTime), ...values]);

  return {
    success: true,
    error: null,
    item: result.rows,
  }
}

async function getDateFromDB(userId, dateId) {
  if (!isInt(dateId)) {
    return {
      success: false,
      error: {
        field: 'id',
        error: 'id must be an integer',
      },
      item: null,
    }
  }

  const q = `
    SELECT 
      *
    FROM  
      dates 
    WHERE 
      id = $1 
    AND
      id IN (
        SELECT 
          dateId
        FROM
          userdates
        WHERE
          userId = $2)`;
  
  const result = await query(q, [xss(dateId), xss(userId)]);

  if (result.rows.length == 0) {
    return {
      success: false,
      error: {
        field: 'id',
        error: 'this date does not belong to you',
      },
      item: null,
    }
  }

  return {
    success: true,
    error: null,
    item: result.rows[0],
  }
}

async function getOneDayDatesFromDB(year, month, day, id) {
  const validation = validateDay({ year, month, day});

  if (validation.length > 0) {
    return {
      success: false,
      error: validation,
      item: null,
    }
  }

  const startTime = `${xss(year)}-${xss(month)}-${xss(day)} 00:00:00`;
  const endTime = `${xss(year)}-${xss(month)}-${xss(day)} 23:59:59`;

  console.log('startTime');
  console.log(startTime);
  console.log('endTime');
  console.log(endTime);

  const q = `
    SELECT 
      *
    FROM
      dates 
    WHERE 
      ((startTime BETWEEN $1 AND $2 OR endTime BETWEEN $1 AND $2)
    OR 
      (startTime < $1 AND endTime > $2))
    AND 
      id 
    IN (
      SELECT 
        dateId
      FROM
        userdates
      WHERE 
        userId = $3
    )
    `;
  
  const result = await query(q, [startTime, endTime, id]);

  return {
    success: true,
    error: null,
    item: result.rows,
  }
}

async function getOneMonthDatesFromDB(year, month, id) {
  const date = { year, month };
  const validation = validateMonth(date);

  if (validation.length > 0) {
    return {
      success: false,
      error: validation,
      item: null,
    }
  }

  const startTime = `${xss(date.year)}-${xss(date.month)}-01 00:00:00`;
  const endTime = `${xss(date.year)}-${xss(date.month)}-31 23:59:59`;
  
  const q = `
    SELECT 
      *
    FROM
      dates 
    WHERE 
      ((startTime BETWEEN $1 AND $2 OR endTime BETWEEN $1 AND $2)
    OR 
      (startTime < $1 AND endTime > $2))
    AND 
      id 
    IN (
      SELECT 
        dateId
      FROM
        userdates
      WHERE 
        userId = $3
    )
    `;
  
  const result = await query(q, [startTime, endTime, id]);

  return {
    success: true,
    error: null,
    item: result.rows,
  }
}

async function deleteMeFromDateFromDB(userId, dateId) {
  if (!dateId || !isInt(dateId)) {
    return {
      success: false,
      error: {
        field: 'id',
        error: 'id must be an integer',
      }
    }
  }

  let q = `
    SELECT 
      *
    FROM
      userdates
    WHERE
      userId = $1 AND dateId = $2`;
  
  let result = await query(q, [userId, dateId]);

  if (result.rows.length === 0) {
    return {
      success: false,
      error: {
        field: 'id',
        error: 'this date does not belong to you',
      }
    }
  }

  q = `
  DELETE FROM
    userdates
  WHERE
    userId = $1 AND dateId = $2`;
  
  result = await query(q, [userId, dateId]);

  return {
    success: true,
  }
}

module.exports = {
  addDateToDB,
  getDateFromDB,
  getOneDayDatesFromDB,
  getOneMonthDatesFromDB,
  deleteMeFromDateFromDB,
}