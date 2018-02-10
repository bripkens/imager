const {ExifImage} = require('exif');

const {metricsCollection} = require('../measured');

const readHistogram = metricsCollection.histogram('indexer.exif.read');
const readErrors = metricsCollection.meter('indexer.exif.readErrors');

exports.getExif = path => {
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
