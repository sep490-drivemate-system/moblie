// Inspect some specific PNGs that fail AAPT on Android build
// Usage: node check-image-meta.js
const path = require('path');
const sharp = require('sharp');

const dir = path.join(__dirname, 'assets', 'images');

const targetFiles = [
  'image_2-guide1.png',
  'image_2-guide9.png',
  'image_1-guide9.png',
  'image_2-guide7.png',
  'image_1-guide5.png',
  'image_1-guide7.png',
];

async function run() {
  for (const file of targetFiles) {
    const filePath = path.join(dir, file);
    try {
      const meta = await sharp(filePath).metadata();
      console.log('====', file, '====');
      console.log('format:', meta.format);
      console.log('size  :', meta.width, 'x', meta.height);
      console.log('space :', meta.space);
      console.log('hasAlpha:', meta.hasAlpha);
      console.log();
    } catch (e) {
      console.log('ERROR reading', file, '-', e.message);
    }
  }
}

run();





