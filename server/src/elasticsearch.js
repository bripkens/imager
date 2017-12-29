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

exports.getCitiesOverview = async () => {
  const result = await client.search({
    index: 'imager',
    type: 'image',
    body: {
      "aggs": {
        "cities": {
          "terms": {
            "field" : "city.keyword",
            "missing": "N/A"
          },
          "aggs": {
            "location": {
              "geo_centroid" : {
                "field": "location"
              }
            }
          }
        }
      }
    }
  });
  return result.aggregations.cities.buckets.map(bucket => {
    return {
      city: bucket.key,
      numberOfPhotos: bucket.doc_count,
      location: bucket.location.location
    };
  });
};
