const { query } = require('../utils/db');
const xss = require('xss');

const { isInt } = require('../utils/validation');

const { findById } = require('../authentication/users');

async function addFriendIntoDB(friendsUsername, user) {
  let q = `SELECT id FROM users WHERE username = $1`;
  const friendId = await query(q, [xss(friendsUsername)]);

  if (!friendId || friendId.rows[0].id == user.id) {
    return {
      friend: false,
      friendsAlready: false,
      fail: true,
      item: null,
    }
  }

  // athuga hvort þeir séu þegar vinir
  q = `SELECT * FROM friends WHERE userId = $1 AND friendId = $2`;

  const check = await query(q, [friendId.rows[0].id, user.id]);

  if (check.rows != 0) {
    return {
      friend: false,
      friendsAlready: true,
      fail: true,
      item: null,
    }
  }

  q = `INSERT INTO friends (userId, friendId) 
  VALUES ($1, $2), ($2, $1)
  RETURNING *`;
  
  const result = await query(q, [friendId.rows[0].id, user.id]);

  
  if (!result) {
    return {
      friend: true,
      friendsAlready: false,
      fail: true,
      item: null,
    }
  }

  return {
    friend: true,
    friendsAlready: false,
    fail: false,
    item: result,
  }
}

async function listFriendsFromDB(userId) {
  const q = `
  SELECT
    id, username, name, image
  FROM
    users
  WHERE
    id =
    ANY (SELECT
      friendId 
    FROM
      friends
    WHERE
      userId = $1)`;
  
  const result = await query(q, [userId]);

  return result.rows;
}

async function deleteFriendFromDB(userId, friendId) {

  if (!isInt(friendId)) {
    return {
      isInt: false,
      notFound: false,
      notFriends: false,
      item: null,
    }
  }

  let result = await findById(xss(friendId));

  if (!result) {
    return {
      isInt: true,
      notFound: true,
      notFriends: false,
      item: null,
    }
  }

  let q = `
  SELECT
    *
  FROM
   friends
  WHERE
    userId = $1 
  AND
    friendId = $2`;

  result = await query(q, [userId, xss(friendId)]);

  if (result.rows == 0) {
    return {
      isInt: true,
      notFound: false,
      notFriends: true,
      item: null,
    }
  }

  q =`
  DELETE FROM
    friends
  WHERE
    userId = $1 AND friendId = $2
  OR
    userId = $2 AND friendId = $1`;

  result = await query(q, [userId, xss(friendId)]);

  return {
    isInt: true,
    notFound: false,
    notFriends: false,
    item: result,
  }
}

module.exports = {
  addFriendIntoDB,
  listFriendsFromDB,
  deleteFriendFromDB,
};