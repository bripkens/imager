const logger = require('get-logger')('server:elasticsearch');
const elasticsearch = require('elasticsearch');

const config = require('./config');

const client = new elasticsearch.Client({
  host: config.elasticsearch.host,
  log: config.elasticsearch.log,
  apiVersion: config.elasticsearch.apiVersion
});

exports.healthcheck = async () => {
  await client.ping();
  return 'elasticsearch connection works.'
};

exports.getImage = async id => {
  const image = await client.get({
    index: 'imager',
    type: 'image',
    id
  });
  return image._source;
};
