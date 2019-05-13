const express = require('express');
const catchErrors = require('../utils/catchErrors');
const { requireAuth, checkUserIsAdmin } = require('../authentication/auth');

const requireAdmin = [
  requireAuth,
  checkUserIsAdmin,
];
/*
const {
  listCategories,
  listCategory,
  createCategory,
  updateCategory,
  deleteCategory,
} = require('./categories');
*/
const {
  listUsers,
  listUser,
  updateUser,
  currentUser,
  updateCurrentUser,
} = require('./users');

const {
  addFriend,
} = require('./friends');
/*
const {
  listProducts,
  createProduct,
  listProduct,
  updateProduct,
  deleteProduct,
} = require('./products');

const {
  listCart,
  addToCart,
  listCartLine,
  updateCartLine,
  deleteCartLine,
} = require('./cart');

const {
  listOrders,
  createOrder,
  listOrder,
} = require('./orders');
*/

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

// EKKI BÚIN AÐ PRÓFA !!!!
router.post('/users/me/friends', requireAuth, catchErrors(addFriend));

module.exports = router;