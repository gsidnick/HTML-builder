const path = require('node:path');
const fs = require('node:fs');
const { readdir } = require('node:fs/promises');
const { EOL } = require('node:os');
const bundleFile = path.resolve(__dirname, 'project-dist/bundle.css');
const stylesFolder = path.resolve(__dirname, 'styles');

async function createBundle() {
  try {
    const writeStream = fs.createWriteStream(bundleFile);
    const files = await readdir(stylesFolder, { withFileTypes: true });
    const cssFiles = files.filter((file) => path.extname(file.name) === '.css');
    for (const file of cssFiles) {
      const current = path.resolve(stylesFolder, file.name);
      const readStream = fs.createReadStream(current);
      readStream.on('data', chunk => {
        writeStream.write(chunk.toString() + EOL);
      });
    }
  } catch (error) {
    console.error(error.message);
  }
}

void createBundle();