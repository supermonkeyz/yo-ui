#!/usr/bin/env node
const path = require('path');
const fs = require('fs');
const inquirer = require('inquirer');
const ora = require('ora');
const chalk = require('chalk');
const argv = require('minimist')(process.argv.slice(2));
const decamelize = require('decamelize', '-');
const uppercamelcase = require('uppercamelcase');
const forEach = require('async-foreach').forEach;
const stripIndent = require('common-tags').stripIndent;
const endOfLine = require('os').EOL;
const config = require('../lib.config');

const error = content => {
  console.error(chalk.red('✘ ' + content));
  process.exit(1);
};

const log = content => console.log(chalk.green(content));

// Get user most want input value
let commandName;
if (argv._.length > 0) {
  commandName = argv._[0];
} else if (
  Object.values(argv).length > 0 &&
  typeof Object.values(argv)[1] === 'string'
) {
  commandName = Object.values(argv)[1];
}

// Determine if user input value is available
function getName(value) {
  const pass = /^[a-z_-]+$/i.test(value);
  if (!pass || !value) {
    error('Unavailable component name');
  }
  return value;
}

// componentName is use for file name, just like button or action-sheet
// ComponentName is use for module name, just like Button ActionSheet
// nmsp_componentName is use for component name, just like yo-button
const componentName = decamelize(getName(commandName));
const ComponentName = uppercamelcase(componentName);
const nmsp_componentName = config.namespace + '-' + componentName;

// group component
// if you run create script: yarn yo test --g --items group --items item
// you will get a Grouped Component
const groupComponent = !!argv.g;
let groupComponentItems = [];
if (groupComponent) {
  groupComponentItems =
    argv.items && argv.items.length > 0
      ? argv.items.map(arg => componentName + '-' + arg)
      : [`${componentName}-item`];
}

// componentFolder contains all component files
// componentsList is a json file which contains all component's info
const componentFolder = path.resolve('./components/', componentName);
const componentsList = path.resolve('./components/', 'components.json');

// Function generate ./components/index.js
function entryTpl(...args) {
  let importTpl = '';
  let installTpl = '';
  let exportTpl = '';
  args.forEach(arg => {
    importTpl += `import ${uppercamelcase(arg)} from './${arg}';${endOfLine}`;
    installTpl +=
      stripIndent(`
      ${uppercamelcase(arg)}.install = function(Vue) {
        Vue.component(${uppercamelcase(arg)}.name, ${uppercamelcase(arg)});
      };
    `) + endOfLine;
  });
  exportTpl =
    args.length === 1
      ? `export default ${uppercamelcase(args[0])};`
      : `export { ${args.map(arg => uppercamelcase(arg)).join(', ')} };`;
  return importTpl + installTpl + exportTpl;
}

// Function generate ./components/*.vue
function vueTpl(name) {
  return stripIndent(`
    <template lang="html">
      <div :class="$style.main"></div>
    </template>

    <script>
    export default {
      name: '${config.namespace + '-' + name}',
      props: {}
    };
    </script>

    <style lang="postcss" module>
    :root {
    }

    .main {
    }
    </style>
  `);
}

// Function generate ./components/Readme.md
function readmeTpl(name) {
  return stripIndent(`
    ## Basic use
    \`\`\` vue
      <${name}></${name}>
    \`\`\`
  `);
}

// Function generate structure of all files
function fileInfo(componentName, groupComponentItems) {
  const file = function(filename, tpl) {
    return {
      filename: filename,
      path: '',
      content: tpl
    };
  };

  let files = [];
  files.push(file('index.js', entryTpl(componentName, ...groupComponentItems)));

  const vueFiles = [componentName, ...groupComponentItems];

  vueFiles.forEach(item => {
    files.push(file(`${item}.vue`, vueTpl(item)));
  });

  files.push(file('Readme.md', readmeTpl(nmsp_componentName)));

  return files;
}

// Create a component's question
const question = [
  {
    type: 'confirm',
    name: 'component_ok',
    message: `Create ${groupComponent ? 'Group ' : ''}Component: ${chalk.yellow(
      nmsp_componentName
    )}`,
    default: true
  }
];

inquirer.prompt(question).then(function(answers) {
  if (answers.component_ok) {
    if (fs.existsSync(componentFolder)) {
      error(`${componentName} already exists`);
    }

    fs.mkdirSync(componentFolder, function(err) {
      if (err) {
        error(err);
      }
    });

    // Writing json file
    const allDone = function() {
      if (!fs.existsSync(componentsList)) {
        fs.writeFileSync(componentsList, '{}', 'utf8', function(err) {
          if (err) {
            error(err);
          }
        });
      }
      const components = require(componentsList);
      if (components[componentName]) {
        error(`${componentName} already exists`);
      }
      const key = (groupComponent ? '...' : '') + ComponentName;
      components[key] = `./${componentName}`;
      const jsonStream = fs.createWriteStream(componentsList);
      jsonStream.write(JSON.stringify(components, null, '  '), 'utf8');
      jsonStream.end(endOfLine);

      log(`🎉 Component ${componentName} created successfully`);
    };

    // All files have to create
    const files = fileInfo(componentName, groupComponentItems);
    // Creating all files
    forEach(
      files,
      function(file) {
        const createStream = fs.createWriteStream(
          path.join(componentFolder, file.path, file.filename)
        );
        const spinner = ora(
          `Create ${componentName}/${file.path ? file.path + '/' : ''}${
            file.filename
          }`
        );
        const done = this.async();
        createStream.write(file.content, 'utf8', function(err) {
          if (err) {
            spinner.fail(err);
          }
          spinner.succeed();
          done();
        });
        createStream.end(endOfLine);
      },
      allDone
    );
  }
});
