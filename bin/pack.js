#!/usr/bin/env node
const execSync = require('child_process').execSync;
const components = require('../components/components.json');

execSync(
  'vue-cli-service build --target lib --name yo-ui ./components/index.js --dest ./lib/'
);

Object.keys(components).forEach(pack => {
  pack = pack.toLowerCase();
  execSync(
    `vue-cli-service build --target lib --name index ./components/${pack}/index.js --dest ./lib/${pack}`
  );
});
