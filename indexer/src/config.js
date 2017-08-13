const logger = require('get-logger')('indexer:config');

module.exports = {
  admin: {
    http: {
      bindAddress: '127.0.0.1',
      port: 2998
    }
  },

  imageDir: getVarOrFail('INDEXER_IMAGE_DIR'),
  imageNameRegex: /\.(png|jpg|jpeg|gif)$/i,

  elasticsearch: {
    host: getVarOrFail('INDEXER_ELASTICSEARCH_HOST'),
    log: getVarOrDefault('INDEXER_ELASTICSEARCH_LOG', 'info'),
    apiVersion: getVarOrDefault('INDEXER_ELASTICSEARCH_API_VERSION', '5.5')
  },

  geonames: {
    citiesFile: getVarOrFail('INSTANA_GEONAMES_CITY_FILE'),
    countryFile: getVarOrFail('INSTANA_GEONAMES_COUNTRY_FILE')
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
