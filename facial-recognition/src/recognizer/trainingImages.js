const {groupBy} = require('lodash');
const path = require('path');

const config = require('../config');


exports.getTrainingImageCatalog = async () => {
  const files = await glob(`${config.trainingDataDir}/*/*.jpg`);
  return groupBy(files, getPersonName);
};


function glob(pattern, options) {
  return new Promise((resolve, reject) => {
    require('glob')(pattern, options, (err, files) => err === null ? resolve(files) : reject(err))
  })
}


function getPersonName(p) {
  const rel = path.relative(config.trainingDataDir, p);
  const match = rel.match(/^([^/]+)/);
  if (!match) {
    throw new Error(`Path ${p} does not use the expected path name format`);
  }
  return match[1];
}
