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

async function findByUsername(username) {
  const q = `
    SELECT
      id, username, password
    FROM
      users
    WHERE username = $1`;

  const result = await query(q, [username]);

  if (result.rowCount === 1) {
    return result.rows[0];
  }

  return null;
}

async function findByEmail(email) {
  const q = `
    SELECT
      id, username, password
    FROM
      users
    WHERE email = $1`;

  const result = await query(q, [email]);

  if (result.rowCount === 1) {
    return result.rows[0];
  }

  return null;
}

async function validateUser (
  { username, password, name } = {},
  patching = false,
  id = null,
) {
  const validations = [];

  console.log('password: ' + password + ', name: ' + name + ', username: ' + username);

  // can't patch username
  if (!patching) {
    if (!isNotEmptyString(username, { min: 3, max: 32 })) {
      validations.push({
        field: 'Username',
        error: lengthValidationError(username, 3, 32),
      });
    }

    const user = await findByUsername(username);

    if (user) {
      validations.push({
        field: 'Username',
        error: 'Username exists',
      });
    }
  }

  if (!patching || password || isEmpty(password)) {
    if (badPasswords.indexOf(password) >= 0) {
      validations.push({
        field: 'Password',
        error: 'Password is too bad',
      });
    }

    if (!isNotEmptyString(password, { min: 8 })) {
      validations.push({
        field: 'Password',
        error: lengthValidationError(password, 8),
      });
    }
  }

  if (!patching || name || isEmpty(name)) {
    console.log(name);
    if (!isNotEmptyString(name, { min: 1, max: 64 })) {
      validations.push({
        field: 'Name',
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
      id, username, name, image
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

async function createUser(username, password, name) {
  const hashedPassword = await bcrypt.hash(password, bcryptRounds);

  const q = `
    INSERT INTO
      users (username, name, password)
    VALUES
      ($1, $2, $3)
    RETURNING *`;

  const values = [xss(username), xss(name), hashedPassword];
  const result = await query(
    q,
    values,
  );

  return result.rows[0];
}

async function updateUser(id, password, name) {
  if (!isInt(id)) {
    return null;
  }

  const fields = [
    isString(password) ? 'password' : null,
    isString(name) ? 'name' : null,
  ];

  let hashedPassword = null;

  if (password) {
    hashedPassword = await bcrypt.hash(password, bcryptRounds);
  }

  const values = [
    hashedPassword,
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