const logger = require('get-logger')('indexer:elasticsearch');
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

exports.saveImages = async images => {
  const body = images.reduce((agg, image) => {
    agg.push({index: { _index: 'imager', _type: 'image', _id: image.path}});
    agg.push(image);
    return agg;
  }, []);
  await client.bulk({body});
};
