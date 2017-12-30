const logger = require('get-logger')('indexer:elasticsearch');
const elasticsearch = require('elasticsearch');

const config = require('./config');

const client = new elasticsearch.Client({
  host: config.elasticsearch.host,
  log: config.elasticsearch.log,
  apiVersion: config.elasticsearch.apiVersion
});

exports.start = async () => {
  await client.indices.delete({
    ignore: [404],
    index: 'imager'
  });
  await client.indices.create({
    index: 'imager',
    body: {
      'settings': {
        'number_of_shards': 1
      },
      'mappings': {
        'image': {
          'properties': {
            'id': {
              'type': 'text',
              'index': false
            },
            'path': {
              'type': 'text',
              'index' : false
            },
            'hasExif': {'type': 'boolean'},
            'saveDate': {'type': 'date'},
            'date': {'type': 'date'},
            'year': {'type': 'integer'},
            'camera': {'type': 'text'},
            'lens': {'type': 'text'},
            'width': {'type': 'integer'},
            'height': {'type': 'integer'},
            'aspectRatio': {'type': 'double'},
            'subjectArea': {'type': 'double'},
            'geo': {
              'type': 'object',
              'properties': {
                'coords': {'type': 'geo_point'},
                'city': {'type': 'text'},
                'county': {'type': 'text'},
                'country': {'type': 'text'},
                'continent': {'type': 'text'},
                'location': {
                  'type': 'text',
                  'fields': {
                    'keyword': {
                      'type': 'keyword'
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  });
};

exports.healthcheck = async () => {
  await client.ping();
  return 'elasticsearch connection works.'
};

exports.saveImages = async images => {
  const body = images.reduce((agg, image) => {
    agg.push({index: { _index: 'imager', _type: 'image', _id: image.id}});
    agg.push(image);
    return agg;
  }, []);
  await client.bulk({body});
};
