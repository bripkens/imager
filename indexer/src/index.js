const logger = require('get-logger')('indexer:index');

require('./indexing').start()
  .catch(err => logger.error('Uncaught error occurred', err));
