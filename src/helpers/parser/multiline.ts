const lineSeparatorRegex: RegExp = /(?:\r\n|\r|\n)/gm;

export function parseMultilineStringToLocal(value: string): string {
  return value.replace(lineSeparatorRegex, '\n');
}
