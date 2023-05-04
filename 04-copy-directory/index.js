const path = require('node:path');
const { access, mkdir, rm, copyFile, readdir } = require('node:fs/promises');

async function copyDir() {
  try {
    const sourceFolder = path.resolve(__dirname, 'files');
    const destinationFolder = path.resolve(__dirname, 'files-copy');
    if (await isExist(destinationFolder)) await remove(destinationFolder);
    const success = await copy(sourceFolder, destinationFolder);
    if (success) {
      console.log('\x1b[32mFolder successfully copied');
    } else {
      throw new Error('\x1b[31mFolder copying error');
    }
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

void copyDir();