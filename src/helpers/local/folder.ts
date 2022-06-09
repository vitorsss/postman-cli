import {
  Folder,
  instanceOfFolder,
  instanceOfResponse,
  Item,
} from '@pm-types/local';
import { mkdir, readdir } from 'fs/promises';
import path from 'path';
import {
  encodeItemName,
  saveRawData,
  loadRawData,
  decodeItemName,
} from '@helpers/local/item';
import { saveAuth, loadAuth } from '@helpers/local/auth';
import { saveRequest, loadRequest } from '@helpers/local/request';
import { saveResponse, loadResponse } from '@helpers/local/response';

export async function saveFolder(dir: string, name: string, folder: Folder) {
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
    const encodedItemName: string = encodeItemName(itemName);

    if (typeof item === 'string') {
      await saveRawData(folderDir, encodedItemName, item);
    } else if (instanceOfResponse(item)) {
      await saveResponse(folderDir, encodedItemName, item);
    } else if (instanceOfFolder(item)) {
      await saveFolder(folderDir, encodedItemName, item);
    }
  }
}

export async function loadFolder(dir: string, name: string): Promise<Folder> {
  const folderDir: string = path.join(dir, name);
  const files = await readdir(folderDir, {
    withFileTypes: true,
  });

  const folder: Folder = {
    itens: {},
  };

  for (const file of files) {
    const basename: string = path.basename(file.name);
    const decodedBaseName: string = decodeItemName(basename);

    if (file.isDirectory()) {
      folder.itens[decodedBaseName] = await loadFolder(folderDir, basename);
    } else if (basename === 'request.yaml') {
      folder.request = await loadRequest(folderDir);
    } else if (basename === 'auth.yaml') {
      folder.auth = await loadAuth(folderDir);
    } else if (basename.endsWith('_response.yaml')) {
      folder.itens[decodedBaseName] = await loadResponse(folderDir, basename);
    } else {
      folder.itens[decodedBaseName] = await loadRawData(folderDir, basename);
    }
  }

  return folder;
}
