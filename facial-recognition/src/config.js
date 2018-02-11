const logger = require('get-logger')('facial-recognition:config');

module.exports = {
  admin: {
    http: {
      bindAddress: '127.0.0.1',
      port: 2999
    }
  },

  trainingDataDir: getVarOrFail('INDEXER_FACIAL_RECOGNITION_DIR')
};

function getVarOrFail(name) {
  const value = process.env[name];
  if (value == null) {
    logger.error(`Environment variable ${name} is not defined`);
    process.exit(1);
  }
  return value;
}
