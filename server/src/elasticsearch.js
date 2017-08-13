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

exports.getCountriesOverview = async () => {
  const result = await client.search({
    index: 'imager',
    type: 'image',
    body: {
      "aggs": {
        "countries": {
          "terms": {
            "field" : "country.keyword",
            "missing": "N/A"
          },
          "aggregations": {
            "years": {
              "date_histogram" : {
                "field": "date",
                "interval": "year",
                "format": "yyyy",
                "order" : {"_count" : "desc"}
              }
            }
          }
        }
      }
    }
  });
  return result.aggregations.countries.buckets.map(bucket => {
    return {
      country: bucket.key,
      numberOfPhotos: bucket.doc_count,
      years: bucket.years.buckets.map(yearBucket => {
        return {
          year: yearBucket.key_as_string,
          numberOfPhotos: yearBucket.doc_count,
        };
      })
    };
  });
  return result;
};
