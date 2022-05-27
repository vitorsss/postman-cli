import { Configs } from '@pm-types/cmd';
import {
  Auth,
  Folder,
  instanceOfFolder,
  instanceOfResponse,
  Item,
  LocalCollection,
  Request,
  Response,
  schemas,
  Variables,
} from '@pm-types/local';
import { mkdir, writeFile } from 'fs/promises';
import { dump, DumpOptions } from 'js-yaml';
import path from 'path';

const opts: DumpOptions = {
  noRefs: true,
  sortKeys: true,
  lineWidth: 4000,
};

async function saveVariables(dir: string, variables: Variables) {
  const dumped = dump(variables, opts);

  await writeFile(
    path.join(dir, 'variables.yaml'),
    `# yaml-language-server: $schema=${schemas.variables}\n${dumped}`
  );
}

async function saveAuth(dir: string, auth: Auth) {
  const dumped = dump(auth, opts);

  await writeFile(
    path.join(dir, 'auth.yaml'),
    `# yaml-language-server: $schema=${schemas.auth}\n${dumped}`
  );
}

async function saveRequest(dir: string, request: Request) {
  const dumped = dump(request, opts);

  await writeFile(
    path.join(dir, 'request.yaml'),
    `# yaml-language-server: $schema=${schemas.request}\n${dumped}`
  );
}

async function saveResponse(dir: string, name: string, response: Response) {
  const dumped = dump(response, opts);

  await writeFile(
    path.join(dir, name),
    `# yaml-language-server: $schema=${schemas.request}\n${dumped}`
  );
}

async function saveRawData(dir: string, name: string, data: string) {
  await writeFile(path.join(dir, name), data);
}

async function saveFolder(dir: string, name: string, folder: Folder) {
  const folderDir: string = path.join(dir, name);
  await mkdir(folderDir, { recursive: true });

  if (folder.auth) {
    await saveAuth(folderDir, folder.auth);
  }

  if (folder.request) {
    await saveRequest(folderDir, folder.request);
  }

  for (const itemName in folder.itens) {
    const item: Item = folder.itens[itemName];

    if (typeof item === 'string') {
      await saveRawData(folderDir, itemName, item);
    } else if (instanceOfResponse(item)) {
      await saveResponse(folderDir, itemName, item);
    } else if (instanceOfFolder(item)) {
      await saveFolder(folderDir, itemName, item);
    }
  }
}

export async function saveLocalCollection(
  options: Configs,
  collection: LocalCollection
): Promise<void> {
  const dir: string = path.join(options.workdir, collection.name);

  await saveFolder(options.workdir, collection.name, collection);

  if (collection.variables) {
    await saveVariables(dir, collection.variables);
  }
}
