const exiftool = require('node-exiftool');

let ep;
async function getExifProcess() {
  if (ep != null) {
    return ep;
  }

  ep = new exiftool.ExiftoolProcess();
  await ep.open();
  return ep;
}

exports.getExif = async path => {
  const exifProcess = await getExifProcess();
  const result = await exifProcess.readMetadata(path, ['-File:all']);
  if (result.error) {
    throw new Error(result.error);
  }
  return result.data;
};
