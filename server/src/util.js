const logger = require('get-logger')('server:util');

exports.aaWrap = fn => (req, res) => {
  Promise.resolve(fn(req, res))
    .catch(err => {
      logger.error('Unhandled error in route for path %s', req.path, err);
      res.sendStatus(500);
    });
};
