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
  await require('./geonames').start();
  await require('./elasticsearch').start();
  require('./admin').start();

  // kick of the indexing action
  await require('./indexing').start();
}
