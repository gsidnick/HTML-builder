const path = require('node:path');
const fs = require('node:fs');
const { stdout } = require('node:process');
const filename = path.resolve(__dirname, 'text.txt');
const readStream = fs.createReadStream(filename, { encoding: 'utf-8' });
let streamData = '';

readStream.on('data', (chunk) => streamData += chunk);
readStream.on('end', () => stdout.write(streamData));
readStream.on('error', (error) => stdout.write(error.message));