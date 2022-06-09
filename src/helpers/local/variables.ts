import { schemas, Variables } from '@pm-types/local';
import { readFile, writeFile } from 'fs/promises';
import { dump, load } from 'js-yaml';
import path from 'path';
import { dumpOptions, defaultEncoding } from '@helpers/local/item';

export async function saveVariables(dir: string, variables: Variables) {
  const dumped = dump(variables, dumpOptions);

  await writeFile(
    path.join(dir, 'variables.yaml'),
    `# yaml-language-server: $schema=${schemas.variables}\n${dumped}`
  );
}

export async function loadVariables(dir: string): Promise<Variables> {
  return load(
    await readFile(path.join(dir, 'variables.yaml'), defaultEncoding)
  ) as Variables;
}
