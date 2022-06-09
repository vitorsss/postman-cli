import { readFile, writeFile } from 'fs/promises';
import { DumpOptions } from 'js-yaml';
import path from 'path';

export const dumpOptions: DumpOptions = {
  noRefs: true,
  sortKeys: true,
  lineWidth: 4000,
};

const specialCharsReplaceName: RegExp = /(\/|\\|>|<|:|"|\||\?|\*|&|;)/g;

export function encodeItemName(itemName: string): string {
  return itemName.replace(specialCharsReplaceName, (partial) =>
    encodeURIComponent(partial)
  );
}
export function decodeItemName(itemName: string): string {
  return decodeURIComponent(itemName);
}

export const defaultEncoding: BufferEncoding = 'utf-8';

export async function saveRawData(dir: string, name: string, data: string) {
  await writeFile(path.join(dir, name), data);
}

export async function loadRawData(dir: string, name: string): Promise<string> {
  return await readFile(path.join(dir, name), defaultEncoding);
}
