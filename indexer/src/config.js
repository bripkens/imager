const logger = require('get-logger')('indexer:config');

module.exports = {
  admin: {
    http: {
      bindAddress: '127.0.0.1',
      port: 2998
    }
  },

  imageDir: getVarOrFail('INDEXER_IMAGE_DIR'),
  imageNameRegex: /\.(png|jpg|jpeg|gif)$/i
};

function getVarOrFail(name) {
  const value = process.env[name];
  if (value == null) {
    logger.error(`Environment variable ${name} is not defined`);
    process.exit(1);
  }
  return value;
}
