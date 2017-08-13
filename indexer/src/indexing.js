const logger = require('get-logger')('indexer:indexing');
const Promise = require('bluebird');
const fs = Promise.promisifyAll(require('fs'));
const promiseLimit = require('promise-limit');
const path = require('path');

const config = require('./config');
const {getExif} = require('./exif');

const concurrentDirectoryIndexingJobLimiter = promiseLimit(2);
const concurrentImageIndexingJobLimiter = promiseLimit(1);

exports.start = async () => {
  logger.info('Starting to index directory %s', config.imageDir);
  await indexDirectory(config.imageDir);
}

async function indexDirectory(directory) {
  const names = await fs.readdirAsync(directory);
  const paths = names.map(name => path.join(directory, name));
  const {dirs, imgs} = await categorizePaths(paths);
  await Promise.all(dirs.map(dirPath => concurrentDirectoryIndexingJobLimiter(() => indexDirectory(dirPath))));
  await Promise.all(imgs.map(imgPath => concurrentImageIndexingJobLimiter(() => indexImage(imgPath))));
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
  logger.info('Indexing %s', path);
  let hasExif = false;
  let exif = {};

  if (/\.jpe?g$/i.test(path)) {
    try {
      exif = await getExif(path);
      hasExif = true;
    } catch (e) {
      if (e.code !== 'NO_EXIF_SEGMENT') {
        throw e;
      }
    }
  }
}
