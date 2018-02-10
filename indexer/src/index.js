require('dotenv').config();

const logger = require('get-logger')('indexer:index');
const Promise = require('bluebird');

Promise.promisifyAll(require('fs'));

main()
  .then(() => {
    logger.info('Finished indexing');
    process.exit(0);
  }, err => {
    logger.error('Uncaught error occurred', err);
    process.exit(1);
  });

async function main() {
  require('./admin').start();
  await require('./imageHandling/geonames').start();
  await require('./elasticsearch').start();

  // kick of the indexing action
  await require('./indexing').start();
}
