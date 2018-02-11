const router = module.exports = require('express').Router();
const {getImage} = require('../elasticsearch');
const {aaWrap} = require('../util');

router.get('/images/:id', aaWrap(async (req, res) => {
  try {
    const image = await getImage(req.params.id);
    res.sendFile(image.path);
  } catch (e) {
    if (e.status === 404) {
      res.sendStatus(404);
    } else {
      throw e;
    }
  }
}));

router.get('/images/:id/:width', aaWrap(async (req, res) => {
  try {
    const image = await getImage(req.params.id);
    const version = image.resizedVersions.find(v => String(v.width) === req.params.width);
    if (version) {
      res.sendFile(version.path);
    } else {
      res.sendStatus(404);
    }
  } catch (e) {
    if (e.status === 404) {
      res.sendStatus(404);
    } else {
      throw e;
    }
  }
}));
