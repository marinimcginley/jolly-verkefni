const xss = require('xss');

const {
    validateUser,
    updateUser,
    findById,
  } = require('../authentication/users');
  
  const { query, pagedQuery } = require('../utils/db');
  const { isBoolean } = require('../utils/validation');
  const addPageMetadata = require('../utils/addPageMetadata');
  
  async function listUsers(req, res) {
    const { offset = 0, limit = 10, search = undefined } = req.query;
    
    let users;

    if (xss(search)) {
      users = await pagedQuery(
        `SELECT
          id, username, name, image
        FROM
          users
        WHERE username LIKE '%' || $1 || '%' OR name LIKE '%' || $2 || '%'`,
        [xss(search), xss(search)],
        { offset, limit },
      );

    } else {
      users = await pagedQuery(
        `SELECT
          id, username, name, image
        FROM
          users`,
        [],
        { offset, limit },
      );
    }
  
    const usersWithPage = addPageMetadata(
      users,
      req.path,
      { offset, limit, length: users.items.length },
    );
  
    return res.json(usersWithPage);
  }
  
  async function listUser(req, res) {
    const { id } = req.params;
  
    const user = await findById(id);
  
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
  
    return res.json(user);
  }
  
  async function currentUserRoute(req, res) {
    const { user: { id } = {} } = req;
  
    const user = await findById(id);
  
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
  
    return res.json(user);
  }
  
  async function updateCurrentUser(req, res) {
    const { id } = req.user;
  
    const user = await findById(id);
  
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
  
    const { password, name } = req.body;
  
    const validationMessage = await validateUser({ password, name }, true, id);
  
    if (validationMessage.length > 0) {
      return res.status(400).json({ errors: validationMessage });
    }
  
    const result = await updateUser(id, password, name);
  
    if (!result) {
      return res.status(400).json({ error: 'Nothing to update' });
    }
  
    return res.status(200).json(result);
  }

 
  
  module.exports = {
    listUsers,
    listUser,
    currentUser: currentUserRoute,
    updateCurrentUser,
  };