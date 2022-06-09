import { Auth, schemas } from '@pm-types/local';
import { readFile, writeFile } from 'fs/promises';
import { dump, load } from 'js-yaml';
import path from 'path';
import { dumpOptions, defaultEncoding } from '@helpers/local/item';

export async function saveAuth(dir: string, auth: Auth) {
  const dumped = dump(auth, dumpOptions);

  await writeFile(
    path.join(dir, 'auth.yaml'),
    `# yaml-language-server: $schema=${schemas.auth}\n${dumped}`
  );
}

export async function loadAuth(dir: string): Promise<Auth> {
  return load(
    await readFile(path.join(dir, 'auth.yaml'), defaultEncoding)
  ) as Auth;
}
