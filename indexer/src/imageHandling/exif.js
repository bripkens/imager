const logger = require('get-logger')('indexer:imageHandling:exif');
const {ExifImage} = require('exif');
const {metricsCollection} = require('../measured');

const readHistogram = metricsCollection.histogram('indexer.exif.read');
const readErrors = metricsCollection.meter('indexer.exif.readErrors');

exports.getExif = async p => {
  let hasExif = false;
  let exif = {};

  if (/\.jpe?g$/i.test(p)) {
    try {
      exif = await loadExif(p);
      hasExif = true;
    } catch (e) {
      if (e.code === 'PARSING_ERROR') {
        logger.debug('Image %s has invalid exif data', p);
      } else if (e.code !== 'NO_EXIF_SEGMENT') {
        throw e;
      }
    }
  }

  return {hasExif, exif};
}

function loadExif(path) {
  const start = Date.now();

  return new Promise((resolve, reject) => {
    try {
      new ExifImage({image: path}, (error, exifData) => { // eslint-disable-line
        if (error) {
          readErrors.mark();
          reject(error);
        } else {
          readHistogram.update(Date.now() - start);
          resolve(exifData);
        }
      });
    } catch (e) {
      readErrors.mark();
      reject(e);
    }
  });
}
