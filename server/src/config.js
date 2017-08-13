const logger = require('get-logger')('server:config');

module.exports = {
  http: {
    bindAddress: '127.0.0.1',
    port: 2998
  },

  admin: {
    http: {
      bindAddress: '127.0.0.1',
      port: 2997
    }
  },

  elasticsearch: {
    host: getVarOrFail('SERVER_ELASTICSEARCH_HOST'),
    log: getVarOrDefault('SERVER_ELASTICSEARCH_LOG', 'info'),
    apiVersion: getVarOrDefault('SERVER_ELASTICSEARCH_API_VERSION', '5.5')
  }
};

function getVarOrFail(name) {
  const value = process.env[name];
  if (value == null) {
    logger.error(`Environment variable ${name} is not defined`);
    process.exit(1);
  }
  return value;
}

function getVarOrDefault(name, fallback) {
  const value = process.env[name];
  if (value == null) {
    return fallback;
  }
  return value;
}
