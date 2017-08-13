const logger = require('get-logger')('indexer:indexing');
const Promise = require('bluebird');
const fs = Promise.promisifyAll(require('fs'));
const promiseLimit = require('promise-limit');
const dms2dec = require('dms2dec');
const moment = require('moment');
const path = require('path');

const {searchForGeoLocation} = require('./geonames');
const {saveImages} = require('./elasticsearch');
const {getExif} = require('./exif');
const config = require('./config');

const concurrentImageIndexingJobLimiter = promiseLimit(3);

// used to detect loops
const indexedDirectories = {};

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

async function toImageData(path) {
  logger.debug('Indexing image %s', path);
  let hasExif = false;
  let exif = {};

  if (/\.jpe?g$/i.test(path)) {
    try {
      exif = await getExif(path);
      hasExif = true;
    } catch (e) {
      if (e.code === 'PARSING_ERROR') {
        logger.debug('Image %s has invalid exif data', path);
      } else if (e.code !== 'NO_EXIF_SEGMENT') {
        throw e;
      }
    }
  }

  const image = {path, hasExif};

  if (hasExif) {
    image.width = exif.exif.ExifImageWidth;
    image.height = exif.exif.ExifImageHeight;
    image.aspectRatio = Number((image.width / image.height).toFixed(2));
    image.camera = `${exif.image.Make} ${exif.image.Model}`;
    image.lens = `${exif.exif.LensMake} ${exif.exif.LensModel}`
    if (exif.image.DateTimeOriginal) {
      image.date = moment(exif.image.DateTimeOriginal, 'YYYY:MM:DD HH:mm:ss').toDate().getTime();
    }
    image.subjectArea = exif.exif.SubjectArea;
    if (exif.gps.GPSLatitude && exif.gps.GPSLongitude) {
      const location = dms2dec(exif.gps.GPSLatitude, exif.gps.GPSLatitudeRef, exif.gps.GPSLongitude, exif.gps.GPSLongitudeRef);
      image.location = {
        lat: location[0],
        lon: location[1]
      };

      const geo = searchForGeoLocation(location[0], location[1]);
      if (geo) {
        image.city = geo.city;
        image.country = geo.country;
        image.continent = geo.continent;
      }
    }
  }

  return image;
}
