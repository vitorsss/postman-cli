import { Request, schemas } from '@pm-types/local';
import { readFile, writeFile } from 'fs/promises';
import { dump, load } from 'js-yaml';
import path from 'path';
import { dumpOptions, defaultEncoding } from '@helpers/local/item';

export async function saveRequest(dir: string, request: Request) {
  const dumped = dump(request, dumpOptions);

  await writeFile(
    path.join(dir, 'request.yaml'),
    `# yaml-language-server: $schema=${schemas.request}\n${dumped}`
  );
}

export async function loadRequest(dir: string): Promise<Request> {
  return load(
    await readFile(path.join(dir, 'request.yaml'), defaultEncoding)
  ) as Request;
}
