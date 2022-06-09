import { Configs } from '@pm-types/cmd';
import { Environments, schemas } from '@pm-types/local';
import { existsSync } from 'fs';
import { readFile, writeFile } from 'fs/promises';
import { dump, load } from 'js-yaml';
import path from 'path';
import { defaultEncoding, dumpOptions } from './item';

export async function saveLocalEnvironments(
  options: Configs,
  environments: Environments
): Promise<void> {
  const dumped = dump(environments, dumpOptions);

  await writeFile(
    path.join(options.workdir, 'environments.yaml'),
    `# yaml-language-server: $schema=${schemas.environments}\n${dumped}`
  );
}

export async function loadLocalEnvironments(options: Configs): Promise<Environments | undefined> {
  const fileName = path.join(options.workdir, 'environments.yaml');
  if (!existsSync(fileName)) {
    return;
  }
  return load(
    await readFile(fileName, defaultEncoding)
  ) as Environments;
}
