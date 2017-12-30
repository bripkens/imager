const sharp = require('sharp');

exports.getPreview = async path => {
  const metadata = image.metadata();
  const buffer = await sharp(path)
    .resize(20)
    .jpeg()
    .toBuffer();
  return `data:image/jpeg;base64,${buffer.toString('base64')}`;
};