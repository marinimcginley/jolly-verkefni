const {
  addFriendIntoDB,
  listFriendsFromDB,
  deleteFriendFromDB,
} = require('../DB/friends');

async function addFriend(req, res) {
  const { username } = req.body;
  const { user } = req;
  
  const result = await addFriendIntoDB(username, user);

  if (result.fail && !result.friend && !result.friendsAlready) {
    return res.status(404).json({ error: 'username does not exist' });
  }
  if (result.friendsAlready) {
    return res.status(400).json({ error: 'you are already friends' });
  }

  if (result.fail && result.friend) {
    return res.status(400).json({ error: 'could not add friend' });
  }
  
  return res.status(200).json(result.item.rows);
}

async function listFriends(req, res) {
  const { user } = req;

  const result = await listFriendsFromDB(user.id);

  return res.status(200).json(result);
}

async function deleteFriend(req, res) {
  const { user } = req;
  const { id } = req.params;

  const result = await deleteFriendFromDB(user.id, id);

  if (!result.isInt || result.notFound) {
    return res.status(404).json({ error: 'friendId not found' });
  }

  if (result.notFriends) {
    return res.status(400).json({ error: 'you are not friends' });
  }

  return res.status(204).json({});
}

module.exports = {
  addFriend,
  listFriends,
  deleteFriend,
}