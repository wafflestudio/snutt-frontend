import { OpenAPIV3 } from 'openapi-types';
import fs from 'fs/promises';
import path from 'path';
import { propertyToType } from './utils/propertyToType';

const endpoint = 'https://snutt-api-dev.wafflestudio.com/v3/api-docs';

const run = async () => {
  const data = await fetch(endpoint).then((res) => res.json() as Promise<OpenAPIV3.Document>);

  // step 1: sync schemas
  const schemaString = Object.entries(data.components?.schemas ?? [])
    .map(([name, schema]) => [`export type ${name} = `, propertyToType(schema), ';'].join(''))
    .join('\n\n');

  const schemaFilePath = path.resolve(__dirname, '../../src/apis/snutt-timetable/schemas.ts');
  const originalContent = await fs.readFile(schemaFilePath, 'utf-8');
  fs.writeFile(schemaFilePath, originalContent.split('\n\n')[0] + '\n\n' + schemaString);
};

run();
