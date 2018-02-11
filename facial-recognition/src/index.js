require('dotenv').config();

const logger = require('get-logger')('facial-recognition:index');

main()
  .then(() => {
    logger.info('Finished generating training data set');
    process.exit(0);
  }, err => {
    logger.error('Uncaught error occurred', err);
    process.exit(1);
  });

async function main() {
  await require('./recognizer').start();

  tryIt('New York', '/Users/ben/backup/fotos/2017-03-new-york-washington/2017-03-15 13.02.46.jpg');
  tryIt('Egmond', '/Users/ben/backup/fotos/2015_07-egmond_aan_zee/2015-07-25 17.26.08.jpg');
}

function tryIt(label, p) {
  console.log(label, p);
  const names = require('./recognizer').recognize(p);
  console.log(names);
}
