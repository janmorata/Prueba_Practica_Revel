const { spawn } = require('node:child_process');
const path = require('node:path');

const allureDistPath = path.resolve(__dirname, '..', 'node_modules', 'allure-commandline', 'dist');
const classPathSeparator = process.platform === 'win32' ? ';' : ':';
const classPath = [
  path.join(allureDistPath, 'lib', '*'),
  path.join(allureDistPath, 'config'),
].join(classPathSeparator);

const args = [
  '-classpath',
  classPath,
  'io.qameta.allure.CommandLine',
  ...process.argv.slice(2),
];

const child = spawn('java', args, {
  stdio: 'inherit',
  shell: false,
});

child.on('error', (error) => {
  console.error(error.message);
  process.exit(1);
});

child.on('close', (code) => {
  process.exit(code ?? 1);
});
