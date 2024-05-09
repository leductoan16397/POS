#! /usr/bin/env node
const shell = require('shelljs');

const parseArgs = (args) => {
  const parsedArgs = {};

  args.forEach((arg) => {
    const parts = arg.split('=');

    parsedArgs[parts[0]] = parts[1];
  });

  return parsedArgs;
};

const args = parseArgs(process.argv);

const { mode, name } = args;

if (!mode) {
  throw new Error('Missing argument "name"');
}

if (!name) {
  throw new Error('Missing argument "name"');
}

shell.exec(
  `npm run build && npx typeorm -d dist/${mode}.data.source.js migration:generate src/migration/${mode}/${name}`,
);
