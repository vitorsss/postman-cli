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
import { existsSync } from 'fs';
import { mkdir, readFile, writeFile, readdir } from 'fs/promises';
import { dump, DumpOptions, load } from 'js-yaml';
import path from 'path';

const dumpOptions: DumpOptions = {
  noRefs: true,
  sortKeys: true,
  lineWidth: 4000,
};

const defaultEncoding: BufferEncoding = 'utf-8';

async function saveVariables(dir: string, variables: Variables) {
  const dumped = dump(variables, dumpOptions);

  await writeFile(
    path.join(dir, 'variables.yaml'),
    `# yaml-language-server: $schema=${schemas.variables}\n${dumped}`
  );
}

async function loadVariables(dir: string): Promise<Variables> {
  return load(
    await readFile(path.join(dir, 'variables.yaml'), defaultEncoding)
  ) as Variables;
}

async function saveAuth(dir: string, auth: Auth) {
  const dumped = dump(auth, dumpOptions);

  await writeFile(
    path.join(dir, 'auth.yaml'),
    `# yaml-language-server: $schema=${schemas.auth}\n${dumped}`
  );
}

async function loadAuth(dir: string): Promise<Auth> {
  return load(
    await readFile(path.join(dir, 'auth.yaml'), defaultEncoding)
  ) as Auth;
}

async function saveRequest(dir: string, request: Request) {
  const dumped = dump(request, dumpOptions);

  await writeFile(
    path.join(dir, 'request.yaml'),
    `# yaml-language-server: $schema=${schemas.request}\n${dumped}`
  );
}

async function loadRequest(dir: string): Promise<Request> {
  return load(
    await readFile(path.join(dir, 'request.yaml'), defaultEncoding)
  ) as Request;
}

async function saveResponse(dir: string, name: string, response: Response) {
  const dumped = dump(response, dumpOptions);

  await writeFile(
    path.join(dir, name),
    `# yaml-language-server: $schema=${schemas.response}\n${dumped}`
  );
}

async function loadResponse(dir: string, name: string): Promise<Response> {
  return load(
    await readFile(path.join(dir, name), defaultEncoding)
  ) as Response;
}

async function saveRawData(dir: string, name: string, data: string) {
  await writeFile(path.join(dir, name), data);
}

async function loadRawData(dir: string, name: string): Promise<string> {
  return await readFile(path.join(dir, name), defaultEncoding);
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

async function loadFolder(dir: string, name: string): Promise<Folder> {
  const folderDir: string = path.join(dir, name);
  const files = await readdir(folderDir, {
    withFileTypes: true,
  });

  const folder: Folder = {
    itens: {},
  };

  for (const file of files) {
    const basename: string = path.basename(file.name);

    if (file.isDirectory()) {
      folder.itens[basename] = await loadFolder(folderDir, basename);
    } else if (basename === 'request.yaml') {
      folder.request = await loadRequest(folderDir);
    } else if (basename === 'auth.yaml') {
      folder.auth = await loadAuth(folderDir);
    } else if (basename.endsWith('_response.yaml')) {
      folder.itens[basename] = await loadResponse(folderDir, basename);
    } else {
      folder.itens[basename] = await loadRawData(folderDir, basename);
    }
  }

  return folder;
}

export async function saveLocalCollection(
  options: Configs,
  collection: LocalCollection
): Promise<void> {
  const dir: string = path.join(options.workdir, 'collections');

  await saveFolder(dir, collection.name, collection);

  if (collection.variables) {
    await saveVariables(path.join(dir, collection.name), collection.variables);
  }
}

export async function loadLocalCollection(
  options: Configs,
  name: string
): Promise<LocalCollection | undefined> {
  const dir: string = path.join(options.workdir, 'collections');
  const collectionDir: string = path.join(dir, name);

  if (!existsSync(collectionDir)) {
    return;
  }

  const collectionsFolder: Folder = await loadFolder(dir, name);

  const collection: LocalCollection = {
    ...collectionsFolder,
    name,
  };

  if (existsSync(path.join(collectionDir, 'variables.yaml'))) {
    collection.variables = await loadVariables(
      path.join(collectionDir, 'variables.yaml')
    );
  }

  return collection;
}
