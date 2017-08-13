const logger = require('get-logger')('server:express');
const express = require('express');
const bodyParser = require('body-parser');

const config = require('./config');

exports.start = () => {
  const app = express();
  app.set('x-powered-by', false);

  app.use(bodyParser.json({ limit: '256kb' }));

  app.use(require('./routes/images'));

  app.listen(config.http.port, config.http.bindAddress, () => {
    logger.info(`App listening on port ${config.http.port}!`);
  });
};
