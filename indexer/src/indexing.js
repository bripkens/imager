const logger = require('get-logger')('indexer:indexing');
const Promise = require('bluebird');
const fs = Promise.promisifyAll(require('fs'));
const promiseLimit = require('promise-limit');
const path = require('path');

const config = require('./config');
const {getExif} = require('./exif');

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
  await Promise.all(imgs.map(imgPath => concurrentImageIndexingJobLimiter(() => indexImage(imgPath))));
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

async function indexImage(path) {
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
}
