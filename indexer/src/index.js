const logger = require('get-logger')('indexer:index');
require('./admin');

require('./indexing').start()
  .then(() => {
    logger.info('Finished indexing');
    process.exit(0);
  }, err => {
    logger.error('Uncaught error occurred', err);
    process.exit(1);
  });
