const express = require('express');
const catchErrors = require('../utils/catchErrors');
const { requireAuth } = require('../authentication/auth');

const {
  listUsers,
  listUser,
  currentUser,
  updateCurrentUser,
  updateImage,
} = require('./users');

const {
  addFriend,
  listFriends,
  deleteFriend,
} = require('./friends');

const {
  addEvent,
  getOneEvent,
  patchEvent,
  deleteEvent,
} = require('./events');

const router = express.Router();

function indexRoute(req, res) {
  return res.json({
    users: {
      users: '/users?search={query}',
      user: '/users/{id}',
      register: '/users/register',
      login: '/users/login',
      me: '/users/me',
      friends: '/user/me/friends',
    },
    events: {
      events: '/events',
      event: '/events/{id}',
    },
    dates: {
      dates: '/dates',
      date: '/dates/{id}',
    },
  });
}

router.get('/', indexRoute);

router.get('/users', requireAuth, catchErrors(listUsers));
router.get('/users/me', requireAuth, catchErrors(currentUser));
router.patch('/users/me', requireAuth, catchErrors(updateCurrentUser));
router.get('/users/:id', requireAuth, catchErrors(listUser));
router.patch('/users/me/image', requireAuth, catchErrors(updateImage));

router.post('/users/me/friends', requireAuth, catchErrors(addFriend));
router.get('/users/me/friends', requireAuth, catchErrors(listFriends));
router.delete('/users/me/friends/:id', requireAuth, catchErrors(deleteFriend));

router.post('/events/me', requireAuth, catchErrors(addEvent));
router.get('/events/me/:id', requireAuth, catchErrors(getOneEvent));
router.patch('/events/me/:id', requireAuth, catchErrors(patchEvent));
router.delete('/events/me/:id', requireAuth, catchErrors(deleteEvent));

module.exports = router;