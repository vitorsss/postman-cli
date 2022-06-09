import { Response, schemas } from '@pm-types/local';
import { readFile, writeFile } from 'fs/promises';
import { dump, load } from 'js-yaml';
import path from 'path';
import { dumpOptions, defaultEncoding } from '@helpers/local/item';

export async function saveResponse(
  dir: string,
  name: string,
  response: Response
) {
  const dumped = dump(response, dumpOptions);

  await writeFile(
    path.join(dir, name),
    `# yaml-language-server: $schema=${schemas.response}\n${dumped}`
  );
}

export async function loadResponse(
  dir: string,
  name: string
): Promise<Response> {
  return load(
    await readFile(path.join(dir, name), defaultEncoding)
  ) as Response;
}
