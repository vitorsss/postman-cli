#!/usr/bin/env node

import { program } from 'commander';
import configYaml from 'config-yaml';
import { bootstrap, collections, environments } from '@cmd';
import { Configs } from '@pm-types/cmd';

import { version, checkUpdate } from '@helpers/version';

program.version(version, '-v --version');

const configFileFlags = ['-c', '--config'];

const configFileIndex =
  process.argv.findIndex((argv) => {
    return configFileFlags.includes(argv);
  }) + 1;

const configFile: string = configFileIndex
  ? process.argv[configFileIndex]
  : './.pm.yaml';
let config: Configs = {} as any;
try {
  config = configFile ? configYaml(configFile) : config;
  config.config = configFile;
} catch (err) {
  if (err instanceof Error) {
    if (err.message.includes('Unable to read file:')) {
      console.error(err.message);
    }
  } else {
    console.error('unknown error:', err);
  }
}

bootstrap(program, config, config?.cmd?.bootstrap);
collections(program, config, config?.cmd?.collections);
environments(program, config, config?.cmd?.environments);

async function init() {
  await checkUpdate();
  program.parse();
}

init();
