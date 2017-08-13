const logger = require('get-logger')('indexer:index');

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
  await require('./geonames').start();
  await require('./indexing').start();
}
