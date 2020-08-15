const xss = require('xss');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;

const MIMETYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
];

const {
  validateUser,
  updateUser,
  findById,
} = require('../authentication/users');
  
const { query, pagedQuery } = require('../utils/db');
const addPageMetadata = require('../utils/addPageMetadata');

const {
  CLOUDINARY_CLOUD,
  CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET,
} = process.env;

if (!CLOUDINARY_CLOUD || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
  console.warn('Missing cloudinary config, uploading images will not work');
}

cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
});
  
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


function validateImageMimetype(mimetype) {
  return MIMETYPES.indexOf(mimetype.toLowerCase()) >= 0;
}

async function withMulter(req, res, next, fn) {
  multer({ dest: './temp' })
    .single('image')(req, res, (err) => {
      if (err) {
        if (err.message === 'Unexpected field') {
          const errors = [{
            field: 'Image',
            error: 'Unable to read image',
          }];
          return res.status(400).json({ errors });
        }

        return next(err);
      }

      return fn(req, res, next).catch(next);
    });
}

async function updateImage(req, res, next) {
  return withMulter(req, res, next, updateImageInDB);
}

async function updateImageInDB(req, res, next) {
  const { user } = req;

  const { file: { path, mimetype } = {} } = req;

  const hasImage = Boolean(path && mimetype);

  let validations = [];
  let image;

  if (hasImage) {
    if (!validateImageMimetype(mimetype)) {
      validations.push({
        field: 'Image',
        error: `Mimetype ${mimetype} is not legal. ` + 
        `Only ${MIMETYPES.join(', ')} are accepted`,
      });
    }
  }

  if (validations.length > 0) {
    return res.status(400).json({
      errors: validations,
    });
  }

  if (hasImage) {
    let upload = null;
    try {
      upload = await cloudinary.uploader.upload(path);
    } catch (error) {
      if (error.http_code && error.http_code === 400) {
        return res.status(400).json({ errors: [{
          field: 'Image',
          error: error.message,
        }] });
      }
      console.error('Unable to upload file to cloudinary');
      return next(error); 
    }

    if (upload && upload.secure_url) {
      image = upload.secure_url;
    } else {
      return next(new Error('Cloudinary upload missing secure_url'));
    }
  }

  if (!image) {
    return res.status(400).json({ error: 'Nothing to update' });
  }

  const q = `
  UPDATE
    users
  SET 
    image = $1
  WHERE
    id = $2
  RETURNING 
    id, username, name, image`;

  const result = await query(q, [image, user.id]);

  return res.status(201).json(result.rows[0]);
}
  
module.exports = {
  listUsers,
  listUser,
  currentUser: currentUserRoute,
  updateCurrentUser,
  updateImage,
};