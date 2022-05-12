import { compile } from 'json-schema-to-typescript';
import { JSONSchema4 } from 'json-schema';
import { mkdir, readFile, writeFile } from 'fs/promises';
import axios from 'axios';
import path from 'path';

async function schemaFromFile(path: string): Promise<JSONSchema4> {
  return JSON.parse((await readFile(path)).toString());
}

async function schemaFromUrl(url: string): Promise<JSONSchema4> {
  return (await axios(url)).data;
}

async function generateTSFromSchema(schema: JSONSchema4, name: string, dest: string) {
  schema.id = name;
  const compiled = await compile(schema, name, {});
  await mkdir(path.dirname(dest), {recursive: true})
  await writeFile(dest, compiled);
}

async function gen() {
  const mappings = [{
    schema: schemaFromUrl("https://schema.postman.com/json/collection/latest/collection.json"),
    name: "CollectionDetails",
    dest: "./generated/postman/collection.ts"
  }];
  for await (const mapping of mappings) {
    await generateTSFromSchema(await mapping.schema, mapping.name, mapping.dest);
  }
}

gen();
