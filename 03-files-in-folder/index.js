const path = require('node:path');
const { readdir, stat } = require('node:fs/promises');
const folder = path.resolve(__dirname, 'secret-folder');

async function getStat() {
  try {
    const files = await readdir(folder, { withFileTypes: true });
    for(const file of files) {
      if (file.isFile()) {
        const name = path.parse(file.name).name;
        const ext = path.parse(file.name).ext.replace('.', '');
        const fileInfo = await stat(path.join(folder, file.name));
        console.log('\x1b[32m', name, '-', ext, '-', formatSize(fileInfo.size));
      }
    }
    console.log('\x1b[90m┌───────────────────────────────────────────┐');
    console.log('\x1b[90m│ 1 KiB = 1024 byte (IEEE 1541/IEC 60027-2) │');
    console.log('\x1b[90m└───────────────────────────────────────────┘');
  } catch (err) {
    console.error(err.message);
  }
}

function formatSize(size) {
  const unit = ['byte', 'KiB', 'MiB', 'GiB'];
  let index = 0;
  size = Number(size);
  for (let i = 0; i < unit.length - 1; i++) {
    if (size >= 1024) {
      size /= 1024;
      index++;
    }
  }
  size = unit[index] === 'byte' ? size : size.toFixed(3);
  return size + unit[index];
}

void getStat();