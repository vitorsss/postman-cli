#!/usr/bin/env node

import { program } from 'commander';
import configYaml from 'config-yaml';
import { bootstrap, collections } from '@cmd';

program.version(process.env.npm_package_version || 'missing', '-v --version');

const configFileFlags = ['-c', '--config'];

const configFileIndex =
  process.argv.findIndex((argv) => {
    return configFileFlags.includes(argv);
  }) + 1;

const configFile: string = configFileIndex
  ? process.argv[configFileIndex]
  : './.pm.yaml';
let config = {} as any;
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

bootstrap(program, config, config.bootstrap);
collections(program, config, config.collections);

program.parse();
