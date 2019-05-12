const bcrypt = require('bcrypt');
const xss = require('xss');

const badPasswords = require('./bad-passwords');

const {
  isInt,
  isEmpty,
  isNotEmptyString,
  isString,
  toPositiveNumberOrDefault,
  lengthValidationError,
} = require('../utils/validation');
const { query, conditionalUpdate } = require('../utils/db');

const {
  BCRYPT_ROUNDS: bcryptRounds = 11,
} = process.env;

async function findByEmail(email) {
  const q = `
    SELECT
      id, username, password, email, admin
    FROM
      users
    WHERE email = $1`;

  const result = await query(q, [email]);

  if (result.rowCount === 1) {
    return result.rows[0];
  }

  return null;
}

async function validateUser(
  { email, name, password } = {},
  patching = false,
  id = null,
) {
  const validations = [];

  if (!patching || password || isEmpty(password)) {
    if (badPasswords.indexOf(password) >= 0) {
      validations.push({
        field: 'password',
        error: 'Password is too bad',
      });
    }

    if (!isNotEmptyString(password, { min: 8 })) {
      validations.push({
        field: 'password',
        error: lengthValidationError(password, 8),
      });
    }
  }

  if (!patching || email || isEmpty(email)) {
    if (!isNotEmptyString(email, { min: 1, max: 64 })) {
      validations.push({
        field: 'email',
        error: lengthValidationError(1, 64),
      });
    }

    const user = await findByEmail(email);

    if (user) {
      const current = user.id;

      if (patching && id && current === toPositiveNumberOrDefault(id, 0)) {
        // we can patch our own email
      } else {
        validations.push({
          field: 'email',
          error: 'Email exists',
        });
      }
    }
  }

  if (!patching || name || isEmpty(name)) {
    if (!isNotEmptyString(name, { min: 1, max: 64 })) {
      validations.push({
        field: 'email',
        error: lengthValidationError(1, 64),
      });
    }
  }

  return validations;
}

async function comparePasswords(password, hash) {
  const result = await bcrypt.compare(password, hash);

  return result;
}

async function findById(id) {
  if (!isInt(id)) {
    return null;
  }

  const user = await query(
    `SELECT
      id, email, name
    FROM
      users
    WHERE id = $1`,
    [id],
  );

  if (user.rows.length !== 1) {
    return null;
  }

  return user.rows[0];
}

async function createUser(email, name, password) {
  const hashedPassword = await bcrypt.hash(password, bcryptRounds);

  const q = `
    INSERT INTO
      users (name, email, password)
    VALUES
      ($1, $2, $3)
    RETURNING *`;

  const values = [xss(name), xss(email), hashedPassword];
  const result = await query(
    q,
    values,
  );

  return result.rows[0];
}

async function updateUser(id, password, email, name) {
  if (!isInt(id)) {
    return null;
  }

  const fields = [
    isString(password) ? 'password' : null,
    isString(email) ? 'email' : null,
    isString(name) ? 'name': null,
  ];

  let hashedPassword = null;

  if (password) {
    hashedPassword = await bcrypt.hash(password, bcryptRounds);
  }

  const values = [
    hashedPassword,
    isString(email) ? xss(email) : null,
    isString(name) ? xss(name) : null,
  ];

  const result = await conditionalUpdate('users', id, fields, values);

  if (!result) {
    return null;
  }

  const updatedUser = result.rows[0];
  delete updatedUser.password;

  return updatedUser;
}

module.exports = {
  validateUser,
  comparePasswords,
  findByUsername,
  findById,
  createUser,
  updateUser,
};