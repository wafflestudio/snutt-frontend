import { OpenAPIV3_1 } from 'openapi-types';
import fs from 'fs/promises';
import path from 'path';
import { propertyToType } from './utils/propertyToType';

const endpoint = 'https://snutt-api-dev.wafflestudio.com/v3/api-docs';

const run = async () => {
  const data = await fetch(endpoint).then((res) => res.json() as Promise<OpenAPIV3_1.Document>);

  // step 1: sync schemas
  const schemaString = Object.entries(data.components?.schemas ?? [])
    .map(([name, schema]) => [`export type ${name} = `, propertyToType(schema), ';'].join(''))
    .join('\n\n');

  // types.ts 에 정의된 scalar 타입 중 실제로 사용된 것만 import
  const typesFilePath = path.resolve(__dirname, '../../src/apis/snutt-timetable/types.ts');
  const scalarTypeNames = [...(await fs.readFile(typesFilePath, 'utf-8')).matchAll(/export type (\w+)/g)].map(
    ([, name]) => name,
  );
  const usedScalarTypeNames = scalarTypeNames.filter((name) => new RegExp(`\\b${name}\\b`).test(schemaString));
  const importString = `import { ${usedScalarTypeNames.join(', ')} } from './types';`;

  const schemaFilePath = path.resolve(__dirname, '../../src/apis/snutt-timetable/schemas.ts');
  await fs.writeFile(schemaFilePath, importString + '\n\n' + schemaString + '\n');
};

run();
