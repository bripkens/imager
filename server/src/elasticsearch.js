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


exports.getCitiesOverview = async (query) => {
  const req = {
    index: 'imager',
    type: 'image',
    body: {
      'size': 0,
      "aggs": {
        "cities": {
          "terms": {
            "field" : "geo.location.keyword",
            "missing": "N/A",
            "size": 1000
          },
          "aggs": {
            "location": {
              "geo_centroid" : {
                "field": "geo.coords"
              }
            }
          }
        }
      }
    }
  };

  if (query) {
    req.body.query = {
      'bool': {
        'must': [{
          'query_string': {
            'query': query,
            'default_operator': 'AND'
          }
        }]
      }
    };
  }

  const result = await client.search(req);
  return result.aggregations.cities.buckets.map(bucket => {
    return {
      city: bucket.key,
      numberOfPhotos: bucket.doc_count,
      coords: bucket.location.location
    };
  });
};


exports.getImages = async (query) => {
  const result = await client.search({
    index: 'imager',
    type: 'image',
    body: {
      'size': 200,
      'sort': [
        {'date': {'order': 'asc'}}
      ],
      'query': {
        'query_string': {
          'query': query,
          'default_operator': 'AND'
        }
      }
    }
  });
  return result.hits.hits.map(hit => hit._source);
};
