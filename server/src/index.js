const logger = require('get-logger')('server:index');

main()
  .catch(err => {
    logger.error('Uncaught error occurred during server start', err);
  });

async function main() {
  // await require('./elasticsearch').start();
  require('./admin').start();

  // kick of the indexing action
  await require('./express').start();
}
