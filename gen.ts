import { compile, compileFromFile } from 'json-schema-to-typescript';
import { JSONSchema4 } from 'json-schema';
import { mkdir, readFile, writeFile } from 'fs/promises';
import { load } from 'js-yaml';
import axios from 'axios';
import path from 'path';

type FileType = 'json' | 'yaml';

const parserByType = {
  json: JSON.parse,
  yaml: load,
} as {
  [key in FileType]: (text: string) => any;
};

async function schemaFromFile(
  path: string,
  type: FileType
): Promise<JSONSchema4> {
  return parserByType[type]((await readFile(path)).toString());
}

async function schemaFromUrl(url: string): Promise<JSONSchema4> {
  return (await axios(url)).data;
}

async function generateTSFromSchema(mapping: Mapping) {
  const schema = await mapping.schema;
  let name = mapping.name;
  if (name) {
    schema.id = name;
  } else {
    name = schema.title || schema.id;
  }
  if (!name) {
    throw `No name found for mapping: ${JSON.stringify(mapping)}`;
  }
  const compiled = await compile(schema, name, {
    cwd: mapping.cwd,
  });
  await mkdir(path.dirname(mapping.dest), { recursive: true });
  await writeFile(mapping.dest, compiled);
}

interface Mapping {
  schema: Promise<JSONSchema4>;
  name?: string;
  dest: string;
  cwd?: string;
}

async function gen() {
  const mappings: Mapping[] = [
    {
      schema: schemaFromUrl(
        'https://schema.postman.com/json/collection/latest/collection.json'
      ),
      name: 'CollectionDetails',
      dest: './generated/postman/collection.ts',
    },
    {
      schema: schemaFromFile('./schemas/request.yaml', 'yaml'),
      dest: './generated/types/request.ts',
      cwd: './schemas/',
    },
  ];
  for await (const mapping of mappings) {
    await generateTSFromSchema(mapping);
  }
}

gen();
