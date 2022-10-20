// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

const fs = require('fs-extra');
const path = require('path');
const globby = require('globby');
const prettier = require('prettier');
const { pascalCase } = require('change-case');
const { task } = require('../utils/gulp-utils');

const messagesPath = path.join(process.cwd(), 'i18n', 'messages');
const i18nOutputPath = path.join(process.cwd(), 'src', 'i18n', 'interfaces');
const i18nOutputMessagesPath = path.join(process.cwd(), 'src', 'i18n', 'messages');

const prettierConfigPath = path.join(process.cwd(), '.prettierrc');
const prettierOptions = prettier.resolveConfig.sync(prettierConfigPath);

const locales = ['default', 'de-DE'];

async function buildI18n() {
  const components = await generateComponentTypes();

  await writeIndexFile(components);

  await writeTokensFile();
}

async function generateComponentTypes() {
  const components = [];

  for (const messagesFilePath of await globby(path.join(messagesPath, '**/default.json'))) {
    try {
      const componentName = messagesFilePath
        .split('/')
        .slice(-2)[0]
        .replace(/\.json/, '');
      components.push(componentName);

      const dictionary = await getDictionary(messagesFilePath);
      const interfacesFileContent = generateInterfaceForJSON(componentName, dictionary.default);

      const interfacesFolderPath = path.join(i18nOutputPath, componentName);
      const interfacesFilePath = path.join(interfacesFolderPath, 'index.ts');
      await fs.ensureDir(interfacesFolderPath);
      await fs.writeFile(interfacesFilePath, interfacesFileContent);

      for (const locale of locales) {
        const messagesFileContent = generateMessagesForJSON(componentName, dictionary.default, dictionary[locale]);
        const messagesFolderPath = path.join(i18nOutputMessagesPath, locale);
        await fs.ensureDir(messagesFolderPath);
        const messagesFilePath = path.join(messagesFolderPath, `${componentName}.ts`);
        await fs.writeFile(messagesFilePath, messagesFileContent);
      }
    } catch (error) {
      console.error('ERROR', messagesFilePath, error);
    }
  }

  return components;
}

async function writeIndexFile(components) {
  const sorted = [...components].sort();
  const indexFilePath = path.join(i18nOutputPath, 'index.ts');
  const indexFileContent = prettify(
    indexFilePath,
    `
    // Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
    // SPDX-License-Identifier: Apache-2.0

    ${sorted.map(componentName => `import { ${pascalCase(componentName)}I18n } from './${componentName}'`).join('\n')}

    export interface ComponentsI18N {
      ${sorted.map(componentName => `['${componentName}']: ${pascalCase(componentName)}I18n;`).join('\n')}
    }

    export {${sorted.map(componentName => `${pascalCase(componentName)}I18n`).join(',')}}
    `
  );
  await fs.writeFile(indexFilePath, indexFileContent);
}

async function getDictionary(defaultJsonPath) {
  const dictionary = {};
  for (const locale of locales) {
    const localeJsonPath = defaultJsonPath.replace(/[\w-]+\.json$/, `${locale}.json`);
    dictionary[locale] = JSON.parse(await fs.readFile(localeJsonPath, 'utf-8'));
  }
  return dictionary;
}

function generateInterfaceForJSON(componentName, messages) {
  const namespace = {};
  Object.entries(messages).forEach(([name, message]) => defineProperty(componentName, name, message, namespace));
  const definition = renderNamespace(namespace);
  return prettify(
    'temp.ts',
    `
      // Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
      // SPDX-License-Identifier: Apache-2.0

      ${
        definition.indexOf(`${pascalCase(componentName)}Props`) !== -1
          ? `import {${pascalCase(componentName)}Props} from '../../../${componentName}/interfaces'`
          : ''
      }
            
      export interface ${`${pascalCase(componentName)}I18n`} ${definition}
      `
  );
}

function generateMessagesForJSON(componentName, defaultMessages, localeMessages) {
  const namespace = {};
  Object.entries(defaultMessages).forEach(([name, message]) =>
    defineMessagesProperty(componentName, name, message, localeMessages[name], namespace)
  );
  const definition = renderMessagesNamespace(namespace);
  return prettify(
    'temp.ts',
    `
    // Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
    // SPDX-License-Identifier: Apache-2.0

    ${
      definition.indexOf(`${pascalCase(componentName)}Props`) !== -1
        ? `import {${pascalCase(componentName)}Props} from '../../../${componentName}/interfaces'`
        : ''
    }
    import { ${pascalCase(componentName)}I18n } from '../../interfaces';
          
    const messages: ${pascalCase(componentName)}I18n = ${definition};

    export default messages;
      `
  );
}

async function writeTokensFile() {
  const tokensDefinitionPath = path.join(messagesPath, 'tokens', 'default.json');
  const messages = JSON.parse(await fs.readFile(tokensDefinitionPath, 'utf-8'));

  const tokensInterface = generateInterfaceForJSON('Tokens', messages);

  await fs.writeFile(path.join(i18nOutputPath, 'tokens.ts'), tokensInterface);
}

function renderNamespace(namespace) {
  return `{
      ${Object.entries(namespace)
        .map(([name, value]) => `'${name}': ${typeof value === 'string' ? value : renderNamespace(value)}`)
        .join(';\n')}
  }`;
}

function renderMessagesNamespace(namespace) {
  return `{
      ${Object.entries(namespace)
        .map(([name, value]) => `'${name}': ${typeof value === 'string' ? value : renderMessagesNamespace(value)}`)
        .join(',\n')}
  }`;
}

function defineProperty(componentName, name, message, namespace) {
  const [rootName, ...restName] = name.split('.');

  if (restName.length === 0) {
    namespace[rootName] = definePropertyType(componentName, message);
  } else {
    if (!namespace[rootName]) {
      namespace[rootName] = {};
    }
    defineProperty(componentName, restName.join('.'), message, namespace[rootName]);
  }
}

function defineMessagesProperty(componentName, name, message, localeMessage, namespace) {
  const [rootName, ...restName] = name.split('.');

  if (restName.length === 0) {
    namespace[rootName] = definePropertyValue(componentName, message, localeMessage);
  } else {
    if (!namespace[rootName]) {
      namespace[rootName] = {};
    }
    defineMessagesProperty(componentName, restName.join('.'), message, localeMessage, namespace[rootName]);
  }
}

function definePropertyType(componentName, message) {
  const args = captureArguments(componentName, message);
  return args.length === 0 ? 'string' : `(${args.map(arg => `${arg[0]}: ${arg[1]}`).join(',')}) => string`;
}

function definePropertyValue(componentName, message, localeMessage) {
  const args = captureArguments(componentName, message);
  return args.length === 0 ? `\`${localeMessage}\`` : `(${args.map(arg => arg[0]).join(',')}) => \`${localeMessage}\``;
}

function captureArguments(componentName, message) {
  const variables = [];

  let match = null;
  const re = /\$ARG\{(\w+)\}/g;
  while ((match = re.exec(message)) !== null) {
    variables.push(withType(match[1]));
  }

  function withType(arg) {
    if (arg[0] === arg[0].toLowerCase()) {
      return [arg, 'string'];
    }
    return [arg[0].toLowerCase() + arg.slice(1), `${pascalCase(componentName)}Props.${arg}`];
  }

  return variables;
}

function prettify(filepath, content) {
  if (prettierOptions && ['.ts', '.js', '.json'].some(ext => filepath.endsWith(ext))) {
    return prettier.format(content, { ...prettierOptions, filepath });
  }
  return content;
}

module.exports = task('build-i18n', buildI18n);