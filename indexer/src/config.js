const logger = require('get-logger')('indexer:config');

module.exports = {
  imageDir: getVarOrFail('INDEXER_IMAGE_DIR')
};

function getVarOrFail(name) {
  const value = process.env[name];
  if (value == null) {
    logger.error(`Environment variable ${name} is not defined`);
    process.exit(1);
  }
  return value;
}
