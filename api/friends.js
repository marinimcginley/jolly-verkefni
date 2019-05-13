const { addFriendIntoDB } = require('../DB/friends');

async function addFriend(req, res) {
  const { username } = req.body;
  const { user } = req;
  
  const result = addFriendIntoDB(username, user);

  if (result.fail && !result.friend) {
    res.status(404).json({ error: 'username does not exist' });
  }

  if (result.fail && result.friend) {
    res.status(400).json({ error: 'could not add friend' });
  }

  res.status(200).json(result.item);

}