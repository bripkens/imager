const logger = require('get-logger')('indexer:indexing');
const Promise = require('bluebird');
const fs = Promise.promisifyAll(require('fs'));
const promiseLimit = require('promise-limit');
const dms2dec = require('dms2dec');
const moment = require('moment');
const crypto = require('crypto');
const path = require('path');

const {searchForGeoLocation} = require('./geonames');
const {saveImages} = require('./elasticsearch');
const {getExif} = require('./exif');
const config = require('./config');

// used to detect loops
const indexedDirectories = {};
const concurrentImageIndexingJobLimiter = promiseLimit(3);

exports.start = async () => {
  await indexDirectory(config.imageDir);
}

async function indexDirectory(directory) {
  if (indexedDirectories[directory]) {
    logger.debug('Ignore already indexed directory %s', directory);
    return;
  }
  indexedDirectories[directory] = true;

  logger.debug('Indexing directory %s', directory);
  const names = await fs.readdirAsync(directory);
  const paths = names.map(name => path.join(directory, name));
  const {dirs, imgs} = await categorizePaths(paths);
  const images = await Promise.all(imgs.map(imgPath => concurrentImageIndexingJobLimiter(() => toImageData(imgPath))));
  if (images.length > 0) {
    await saveImages(images);
  }
  await Promise.all(dirs.map(dirPath => indexDirectory(dirPath)));
}

async function categorizePaths(paths) {
  const stats = await Promise.all(paths.map(path => fs.statAsync(path)));
  const dirs = [];
  const imgs = [];
  paths.forEach((path, i) => {
    if (stats[i].isDirectory()) {
      dirs.push(path);
    } else if (stats[i].isFile() && config.imageNameRegex.test(path)) {
      imgs.push(path);
    }
  });
  return {dirs, imgs};
}

async function toImageData(p) {
  logger.debug('Indexing image %s', p);
  let hasExif = false;
  let exif = {};

  if (/\.jpe?g$/i.test(p)) {
    try {
      exif = await getExif(p);
      hasExif = true;
    } catch (e) {
      if (e.code === 'PARSING_ERROR') {
        logger.debug('Image %s has invalid exif data', p);
      } else if (e.code !== 'NO_EXIF_SEGMENT') {
        throw e;
      }
    }
  }

  const hash = crypto.createHash('sha256');
  hash.update(path.relative(config.imageDir, p));
  const id = hash.digest('hex');
  const image = {
    id,
    path: p,
    hasExif,
    saveDate: Date.now()
  };

  if (hasExif) {
    image.width = exif.exif.ExifImageWidth;
    image.height = exif.exif.ExifImageHeight;
    image.aspectRatio = Number((image.width / image.height).toFixed(2));
    image.camera = `${exif.image.Make} ${exif.image.Model}`;
    image.lens = `${exif.exif.LensMake} ${exif.exif.LensModel}`
    if (exif.exif.DateTimeOriginal) {
      image.date = moment(exif.exif.DateTimeOriginal, 'YYYY:MM:DD HH:mm:ss').toDate().getTime();
    }
    image.subjectArea = exif.exif.SubjectArea;
    if (exif.gps.GPSLatitude && exif.gps.GPSLongitude) {
      const location = dms2dec(exif.gps.GPSLatitude, exif.gps.GPSLatitudeRef, exif.gps.GPSLongitude, exif.gps.GPSLongitudeRef);
      image.geo = searchForGeoLocation(location[0], location[1]) || {};
      // we are not interested in the coordinates of the city, but we would like to keep using the coords of the pictures
      image.geo.coords = {
        lat: location[0],
        lon: location[1]
      };
      const aggregatableCity = [image.geo.city, image.geo.county, image.geo.country].filter(v => !!v);
      if (aggregatableCity.length > 0) {
        image.geo.aggregatableCity = aggregatableCity.join(', ');
      }
    }
  }

  return image;
}
