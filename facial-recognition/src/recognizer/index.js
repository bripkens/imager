const cv = require('opencv4nodejs');
const {uniq} = require('lodash');

const { getTrainingImageCatalog } = require('./trainingImages');

const regionSize = 80;
let recognizerFn;

exports.start = async () => {
  if (!cv.xmodules.face) {
    throw new Error('exiting: opencv4nodejs compiled without face module');
  }

  recognizerFn = await getRecognizer();
};


exports.recognize = p => recognizerFn(p);


async function getRecognizer() {
  const catalog = await getTrainingImageCatalog();

  const classifier = new cv.CascadeClassifier(cv.HAAR_FRONTALFACE_ALT2);

  const nameMapping = Object.keys(catalog);
  const preProcessingResult = nameMapping
    .reduce(({imgs, labels}, name, i) => {
      const personSpecificImages = catalog[name];

      return {
        imgs: imgs.concat(personSpecificImages.map(p => preProcessTrainingImage(p, classifier))),
        labels: labels.concat(personSpecificImages.map(() => i))
      };
    }, {imgs: [], labels: []});

  const recognizer = new cv.FisherFaceRecognizer();
  recognizer.train(preProcessingResult.imgs, preProcessingResult.labels);
  return recognize.bind(null, classifier, recognizer, nameMapping);
}


function preProcessTrainingImage(p, classifier) {
  const img = cv.imread(p).bgrToGray();

  const faceRects = classifier.detectMultiScale(img).objects;
  if (faceRects.length === 0) {
    throw new Error(`Failed to detect faces in training file ${p}.`);
  }

  return img.getRegion(faceRects[0])
    .resize(regionSize, regionSize);
}


function recognize(classifier, recognizer, nameMapping, p) {
  const img = cv.imread(p).bgrToGray();

  const faceRects = classifier.detectMultiScale(img).objects;
  if (faceRects.length === 0) {
    return [];
  }

  console.log(`Detected ${faceRects.length} faces. ${JSON.stringify(faceRects)}`);

  const names = faceRects.map(rect => {
    const prediction = recognizer.predict(img.getRegion(rect).resize(regionSize, regionSize));
    return prediction ? nameMapping[prediction.label] : null;
  }).filter(n => !!n);

  return uniq(names);
}
