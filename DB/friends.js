const { query } = require('../utils/db');
const xss = require('xss');

async function addFriendIntoDB(friendsUsername, user) {
  // hreinsa friendUsername
  let q = `SELECT id FROM users WHERE username = $1`;
  const friendId = query(q, [xss(friendsUsername)]);

  if (!friendId || friendId == user.id) {
    return {
      friend: false,
      fail: true,
      success: null,
    }
  }

  q = `INSERT INTO friends (userId, friendId) 
  VALUES ($1, $2), ($2, $1)
  RETURNING *`;
  
  const result = await query(q, [friendsUsername, user.id]);

  if (!result) {
    return {
      friend: true,
      fail: true,
      success: null,
    }
  }

  return {
    friend: true,
    fail: false,
    item: result,
  }
}

module.exports = {
  addFriendIntoDB,
};