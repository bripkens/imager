const logger = require('get-logger')('indexer:indexing');

const config = require('./config');
const {getExif} = require('./exif');

exports.start = async () => {
  logger.info('Starting to index directory %s', config.imageDir);

  const start = Date.now();
  const exif = await getExif('/Users/ben/Pictures/2015-02-18_umzug_nach_erkrath/2015-02-18 13.35.20.jpg');
  console.log(exif);
  console.log('took', Date.now() - start);
}

async function indexDirectory(directory) {

}

function getExifData(path) {
  return new Promise((resolve, reject) => {
    new ExifImage({image: path}, (error, exifData) => {
      if (error) {
        reject(error);
      } else {
        resolve(exifData);
      }
    });
  });
}
