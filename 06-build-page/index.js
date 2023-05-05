const path = require('node:path');
const fs = require('node:fs');
const { mkdir, readdir, copyFile, rm, access } = require('node:fs/promises');
const { EOL } = require('node:os');
const componentsFolder = path.resolve(__dirname, 'components');
const stylesFolder = path.resolve(__dirname, 'styles');
const templateFile = path.resolve(__dirname, 'template.html');
const projectFolder = path.resolve(__dirname, 'project-dist');
const projectStyle = path.resolve(projectFolder, 'style.css');
const indexFile = path.resolve(projectFolder, 'index.html');

async function build() {
  try {
    if (await isExist(projectFolder)) await remove(projectFolder);
    await mkdir(projectFolder, { recursive: true });
    await compilePage();
    await createBundle();
    await copyAssets();
  } catch (error) {
    console.error(error.message);
  }
}

async function compilePage() {
  const componentMarkRegExp = /{{(.*?)}}/g;
  const componentNameRegExp = /({{|}})/g;
  const template = await getTemplate(templateFile);
  const components = {};
  const match = template.match(componentMarkRegExp);
  for (let key of match) {
    const componentName = key.replace(componentNameRegExp, '');
    const componentFilename = path.resolve(componentsFolder, componentName + '.html');
    components[key] = await getTemplate(componentFilename);
  }
  const html = template.replace(componentMarkRegExp, (match) => {
    return components[match];
  });
  const writeStream = fs.createWriteStream(indexFile);
  writeStream.write(html);
  writeStream.close();
}

async function copyAssets() {
  const sourceAssets = path.resolve(__dirname, 'assets');
  const destinationAssets = path.resolve(projectFolder, 'assets');
  await copy(sourceAssets, destinationAssets);
}

async function getTemplate (filename) {
  return await readStream(fs.createReadStream(filename));
}

function readStream(stream) {
  return new Promise((resolve, reject) => {
    let data = '';
    stream.on('data', chunk => data += chunk);
    stream.on('end', () => resolve(data));
    stream.on('error', (error) => reject(error));
  });
}

async function createBundle() {
  try {
    const writeStream = fs.createWriteStream(projectStyle);
    const files = await readdir(stylesFolder, { withFileTypes: true });
    const cssFiles = files.filter((file) => path.extname(file.name) === '.css');
    for (const file of cssFiles) {
      const current = path.resolve(stylesFolder, file.name);
      const readStream = fs.createReadStream(current);
      readStream.on('data', chunk => {
        writeStream.write(chunk.toString() + EOL);
      });
    }
    return true;
  } catch (error) {
    console.error(error.message);
  }
}

async function copy(sourcePath, destinationPath) {
  try {
    await mkdir(destinationPath, { recursive: true });
    const files = await readdir(sourcePath, { withFileTypes: true });
    if (files.length !== 0) {
      for(const file of files) {
        if (file.isDirectory()) {
          const sourceFolder = path.resolve(sourcePath, file.name);
          const destinationFolder = path.resolve(destinationPath, file.name);
          await copy(sourceFolder, destinationFolder);
        } else {
          const sourceFile = path.resolve(sourcePath, file.name);
          const destinationFile = path.resolve(destinationPath, file.name);
          await copyFile(sourceFile, destinationFile);
        }
      }
    }
    return true;
  } catch (error) {
    console.error(error.message);
  }
}

async function remove(pathName) {
  try {
    const files = await readdir(pathName, { withFileTypes: true });
    for(const file of files) {
      if (file.isDirectory()) {
        const folder = path.resolve(pathName, file.name);
        await remove(folder);
      } else {
        const filename = path.resolve(pathName, file.name);
        await rm(filename);
      }
    }
    await rm(pathName, { recursive: true });
  } catch (error) {
    console.error(error.message);
  }
}

async function isExist(pathName) {
  try {
    await access(pathName);
    return true;
  } catch (error) {
    if (error.code !== 'ENOENT') console.error(error.message);
    return false;
  }
}

void  build();