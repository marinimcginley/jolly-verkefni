const express = require('express');
const { requireAuth } = require('../auth');

const router = express.Router();

/*
const {
  getAllProducts,
  postProduct,
  getOneProduct,
  patchOneProduct,
  deleteOneProduct,
  postPicture,
} = require('./products');

const {
  usersRoute,
  userRoute,
  adminPatchRouter,
  meRoute,
  mePatchRoute,
  registerRoute,
} = require('./users');

const {
  getAllCategories,
  postCategory,
  patchOneCategory,
  deleteOneCategory,
} = require('./categories');

const {
  orderRoute,
  orderPostRoute,
  getOneOrderRoute,
} = require('./orders');

const {
  cartRoute,
  cartPostRoute,
  getOneLineInCart,
  cartLineDeleteRoute,
  cartLinePatchRoute,
} = require('./cart');
*/

function catchErrors(fn) {
  return (req, res, next) => fn(req, res, next).catch(next);
}

function indexRoute(req, res) {
  return res.json({
    users: {
      users: '/users',
      user: '/user/{id}',
    },
    authentication: {
      register: 'users/register',
      login: 'users/login',
    },
    me: {
      me: '/users/me',
      friends: 'users/me/friends'
    },
    event: {
      event: '/event',
      eventId: '/cart/:id',
    },
    date: {
      date: '/date',
      date: '/date/{id}',
    },
  });
}

router.get('/', indexRoute);

router.get('/users', requireAuth, catchErrors(usersRoute));
router.get('/users/:id', requireAuth, catchErrors(userRoute));
router.post('/users/register', catchErrors(registerRoute));
router.get('/users/me', requireAuth, catchErrors(meRoute));
router.patch('/users/me', requireAuth, catchErrors(mePatchRoute));
// ??? friends

/*
router.get('/products', catchErrors(getAllProducts));
router.post('/products', requireAuth, requireAdmin, catchErrors(postProduct));
router.get('/products/:id', catchErrors(getOneProduct));
router.post('/products/:id/image', catchErrors(postPicture));
router.patch('/products/:id', requireAuth, requireAdmin, catchErrors(patchOneProduct));
router.delete('/products/:id', requireAuth, requireAdmin, catchErrors(deleteOneProduct));

router.get('/categories', catchErrors(getAllCategories));
router.post('/categories', requireAuth, requireAdmin, catchErrors(postCategory));
router.patch('/categories/:id', requireAuth, requireAdmin, catchErrors(patchOneCategory));
router.delete('/categories/:id', requireAuth, requireAdmin, catchErrors(deleteOneCategory));

router.get('/cart', requireAuth, catchErrors(cartRoute));
router.post('/cart', requireAuth, catchErrors(cartPostRoute));

router.get('/cart/line/:id', requireAuth, catchErrors(getOneLineInCart));
router.delete('/cart/line/:id', requireAuth, catchErrors(cartLineDeleteRoute));
router.patch('/cart/line/:id', requireAuth, catchErrors(cartLinePatchRoute));

router.get('/orders', requireAuth, catchErrors(orderRoute));
router.post('/orders', requireAuth, catchErrors(orderPostRoute));
router.get('/orders/:id', requireAuth, catchErrors(getOneOrderRoute));
*/

module.exports = router;