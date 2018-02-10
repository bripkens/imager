const logger = require('get-logger')('indexer:indexing');
const promiseLimit = require('promise-limit');
const Promise = require('bluebird');
const fs = require('fs-extra');
const path = require('path');

const {saveImages} = require('./elasticsearch');
const config = require('./config');
const {processImage} = require('./imageHandling');

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
  const names = await fs.readdir(directory);
  const paths = names.map(name => path.join(directory, name));
  const {dirs, imgs} = await categorizePaths(paths);
  const images = await Promise.all(imgs.map(imgPath => concurrentImageIndexingJobLimiter(() => processImage(imgPath))));
  if (images.length > 0) {
    await saveImages(images);
  }
  await Promise.all(dirs.map(dirPath => indexDirectory(dirPath)));
}

async function categorizePaths(paths) {
  const stats = await Promise.all(paths.map(p => fs.stat(p)));
  const dirs = [];
  const imgs = [];
  paths.forEach((p, i) => {
    if (stats[i].isDirectory()) {
      dirs.push(p);
    } else if (stats[i].isFile() && config.imageNameRegex.test(p)) {
      imgs.push(p);
    }
  });
  return {dirs, imgs};
}
