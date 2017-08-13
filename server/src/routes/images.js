const router = module.exports = require('express').Router();
const {getImage} = require('../elasticsearch');
const {aaWrap} = require('../util');

router.get('/images/:filename', aaWrap(async (req, res) => {
  try {
    const image = await getImage(req.params.filename);
    res.sendFile(image.path);
  } catch (e) {
    if (e.status === 404) {
      res.sendStatus(404);
    } else {
      throw e;
    }
  }
}));
