const logger = require('get-logger')('indexer:imageHandling');
const dms2dec = require('dms2dec');
const moment = require('moment');
const crypto = require('crypto');
const fs = require('fs-extra');
const sharp = require('sharp');
const path = require('path');

const {searchForGeoLocation} = require('./geonames');
const config = require('../config');
const {getExif} = require('./exif');


exports.processImage = async function processImage(p) {
  logger.debug('Processing image %s', p);

  const hash = await getFileHash(p);
  const image = {
    id: getId(p),
    hash,
    path: p,
    relPath: path.relative(config.imageDir, p),
    saveDate: Date.now()
  };

  const cachedVersion = await getCachedVersion(image);
  if (cachedVersion) {
    logger.debug('Skipping processing of image %s. Still cached.', p);
    return cachedVersion;
  }

  const sharpImage = sharp(p).rotate();
  await addDimensionInfo(image, sharpImage);
  await addImagePreview(image, sharpImage);
  await addMeta(image);
  await addResizedVersions(image, sharpImage);

  // this needs to happen as the last step
  await writeImageData(image);

  logger.debug('Finished processing image %s', p);
  return image;
}


function getId(p) {
  const hash = crypto.createHash('sha256');
  hash.update(p);
  return hash.digest('hex');
}


async function getFileHash(p) {
  const content = await fs.readFile(p);
  const hash = crypto.createHash('sha256');
  hash.update(content);
  return hash.digest('hex');
}


async function addDimensionInfo(image, sharpImage) {
  const metadata = await sharpImage.metadata();
  const aspectRatio = Number((metadata.width / metadata.height).toFixed(2));

  image.width = metadata.width;
  image.height = metadata.height;
  image.aspectRatio = aspectRatio;
  image.orientation = aspectRatio > 1 ? 'Landscape' : 'Portrait'
}


async function addMeta(image) {
  const {hasExif, exif} = await getExif(image.path);
  image.hasExif = hasExif;
  if (!hasExif) {
    return;
  }

  image.camera = `${exif.image.Make} ${exif.image.Model}`;
  image.lens = `${exif.exif.LensMake} ${exif.exif.LensModel}`
  image.subjectArea = exif.exif.SubjectArea;

  if (exif.exif.DateTimeOriginal) {
    const time = moment(exif.exif.DateTimeOriginal, 'YYYY:MM:DD HH:mm:ss');
    image.date = time.toDate().getTime();
    image.year = time.format('YYYY');
    image.month = time.format('M');
  }

  if (exif.gps.GPSLatitude && exif.gps.GPSLongitude) {
    const location = dms2dec(exif.gps.GPSLatitude, exif.gps.GPSLatitudeRef, exif.gps.GPSLongitude, exif.gps.GPSLongitudeRef);
    image.geo = searchForGeoLocation(location[0], location[1]) || {};
    // we are not interested in the coordinates of the city, but we would like to keep using the coords of the pictures
    image.geo.coords = {
      lat: location[0],
      lon: location[1]
    };
    const locationParts = [image.geo.city, image.geo.county, image.geo.country].filter(v => !!v);
    if (locationParts.length > 0) {
      image.geo.location = locationParts.join(', ');
    }
  }
}


async function addImagePreview(image, sharpImage) {
  const width = config.imagePreviewSize;
  const height = Math.round(width * (1 / image.aspectRatio));

  const buffer = await sharpImage
    .resize(width, height)
    .jpeg({
      quality: 50,
      force: true
    })
    .toBuffer();
  image.preview = `data:image/jpeg;base64,${buffer.toString('base64')}`;
}


async function addResizedVersions(image, sharpImage) {
  image.resizedVersions = [];

  const outputDir = getOutputDir(image);
  await fs.mkdirp(outputDir);

  const operations = config.imageResponsiveSizes
    .filter(width => width <= image.width)
    .map(width => addResizedVersion(image, sharpImage, outputDir, width));

  await Promise.all(operations);

  image.resizedVersions.sort((a, b) => b - a);

  return image;
}


async function addResizedVersion(image, sharpImage, outputDir, width) {
  const height = Math.round(width * (1 / image.aspectRatio));
  const target = path.join(outputDir, `${width}.jpg`);

  await sharpImage
    .clone()
    .resize(width, height)
    .jpeg({
      quality: 80,
      force: true
    })
    .toFile(target);

  image.resizedVersions.push({width, height, path: target});
}


async function writeImageData(image) {
  const outputDir = getOutputDir(image);
  await fs.mkdirp(outputDir);
  await fs.writeFile(getImageDataFilePath(image), JSON.stringify(image, 0, 2));
}


function getOutputDir(image) {
  return path.join(path.dirname(path.join(config.storageDir, image.relPath)), image.id);
}


async function getCachedVersion(image) {
  try {
    const content = await fs.readFile(getImageDataFilePath(image), {encoding: 'utf8'});
    const existingImage = JSON.parse(content);
    if (existingImage.hash === image.hash) {
      return existingImage;
    }
    return null;
  } catch (e) {
    return false;
  }
}


function getImageDataFilePath(image) {
  return path.join(getOutputDir(image), 'data.json');
}
