const path = require('node:path');
const fs = require('node:fs');
const { EOL } = require('node:os');
const { stdin, stdout } = require('node:process');
const readline = require('node:readline');
const filename = path.resolve(__dirname, 'log.txt');
const writeStream = fs.createWriteStream(filename, { encoding: 'utf-8' });
const rl = readline.createInterface({ input: stdin, output: stdout });

rl.write('Hello, RS School Student!' + EOL);
rl.write('Enter your text below...' + EOL);
rl.on('line', (data) => {
  const isExitCommand = data.toString().trim() === 'exit';
  if (!isExitCommand) {
    writeStream.write(data + EOL);
  } else {
    rl.close();
  }
});
rl.on('close', () => console.log('Check out your text in log.txt!'));