import { Configs } from '@pm-types/cmd';
import { Globals, schemas } from '@pm-types/local';
import { existsSync } from 'fs';
import { readFile, writeFile } from 'fs/promises';
import { dump, load } from 'js-yaml';
import path from 'path';
import { defaultEncoding, dumpOptions } from './item';

export async function saveLocalGlobals(
  options: Configs,
  globals: Globals
): Promise<void> {
  const dumped = dump(globals, dumpOptions);

  await writeFile(
    path.join(options.workdir, 'globals.yaml'),
    `# yaml-language-server: $schema=${schemas.globals}\n${dumped}`
  );
}

export async function loadLocalGlobals(options: Configs): Promise<Globals | undefined> {
  const fileName = path.join(options.workdir, 'globals.yaml');
  if (!existsSync(fileName)) {
    return;
  }
  return load(
    await readFile(fileName, defaultEncoding)
  ) as Globals;
}
