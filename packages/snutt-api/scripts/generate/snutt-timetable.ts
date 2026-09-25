/**
 * snutt 백엔드의 v1(v1compat), v2 OpenAPI 명세를 받아 기록하고 타입을 생성한다.
 *
 * - specs/<버전>.json                          받아온 명세 원본 (API 변경을 diff 로 확인하기 위함)
 * - src/apis/snutt-timetable/<버전>/schemas.ts 생성된 타입
 */
import { OpenAPIV3_1 } from 'openapi-types';
import fs from 'fs/promises';
import path from 'path';
import { type Presence, propertyToType } from './utils/propertyToType';

const BASE_URL = 'https://snutt-api-dev.wafflestudio.com';

/** 백엔드 swagger 그룹 → 저장할 이름 */
const GROUPS = [
  { name: 'v1compat', version: 'v1' },
  { name: 'v2', version: 'v2' },
] as const;

const packageRoot = path.resolve(__dirname, '../..');
const timetableApiDir = path.resolve(packageRoot, 'src/apis/snutt-timetable');

type Document = OpenAPIV3_1.Document;
type Schemas = Record<string, OpenAPIV3_1.SchemaObject>;

const fetchSpec = async (specPath: string): Promise<Document> => {
  const res = await fetch(BASE_URL + specPath);
  if (!res.ok) throw new Error(`${specPath}: ${res.status}`);
  return res.json() as Promise<Document>;
};

/**
 * 경로들이 참조하는 스키마를 재귀적으로 모은다.
 * 한 번이라도 응답에서 참조되면 response, 요청(body, parameter)에서만 참조되면 request 로 분류한다.
 */
const collectSchemas = (paths: Document['paths'], schemas: Schemas) => {
  const presence = new Map<string, Presence>();

  const visit = (node: unknown, mark: Presence): void => {
    if (!node || typeof node !== 'object') return;
    if (Array.isArray(node)) return node.forEach((item) => visit(item, mark));

    const ref = (node as { $ref?: string }).$ref;
    if (ref) {
      const name = ref.split('/').at(-1)!;
      const prev = presence.get(name);
      if (prev === mark || prev === 'response') return;
      if (!schemas[name]) throw new Error(`스키마 ${name} 를 찾을 수 없습니다`);
      presence.set(name, mark);
      return visit(schemas[name], mark);
    }
    Object.values(node).forEach((value) => visit(value, mark));
  };

  for (const operations of Object.values(paths ?? {})) {
    for (const operation of Object.values(operations ?? {})) {
      if (!operation || typeof operation !== 'object' || !('responses' in operation)) continue;
      visit(operation.parameters, 'request');
      visit(operation.requestBody, 'request');
      visit(operation.responses, 'response');
    }
  }

  // 서버 명세의 순서를 유지한다
  return Object.keys(schemas)
    .filter((name) => presence.has(name))
    .map((name) => ({ name, schema: schemas[name], presence: presence.get(name)! }));
};

const run = async () => {
  // 그룹 명세(/v3/api-docs/<그룹>)는 components.schemas 가 비어 있다.
  // (백엔드 OpenApiConfig 가 components 를 securitySchemes 만으로 덮어씀) 그래서 스키마는 전체 명세에서 가져온다.
  const full = await fetchSpec('/v3/api-docs');
  const scalarTypeNames = [
    ...(await fs.readFile(path.resolve(timetableApiDir, 'types.ts'), 'utf-8')).matchAll(/export type (\w+)/g),
  ].map(([, name]) => name);

  for (const group of GROUPS) {
    const spec = await fetchSpec(`/v3/api-docs/${group.name}`);
    const allSchemas = { ...full.components?.schemas, ...spec.components?.schemas } as Schemas;
    const collected = collectSchemas(spec.paths, allSchemas);

    // 1. 명세 원본 기록 (스키마를 채워 넣어 그 자체로 완결된 명세로 만든다)
    const snapshot: Document = {
      ...spec,
      components: { ...spec.components, schemas: Object.fromEntries(collected.map((c) => [c.name, c.schema])) },
    };
    await fs.mkdir(path.resolve(packageRoot, 'specs'), { recursive: true });
    await fs.writeFile(path.resolve(packageRoot, `specs/${group.version}.json`), JSON.stringify(snapshot, null, 2) + '\n');

    // 2. 타입 생성
    const schemaString = collected
      .map(({ name, schema, presence }) => `export type ${name} = ${propertyToType(schema, presence)};`)
      .join('\n\n');
    const usedScalarTypeNames = scalarTypeNames.filter((name) => new RegExp(`\\b${name}\\b`).test(schemaString));

    const header = [
      `// 자동 생성 파일. 직접 수정하지 않는다. (yarn generate:snutt-timetable)`,
      `// 출처: ${BASE_URL}/v3/api-docs/${group.name}`,
      usedScalarTypeNames.length ? `import { ${usedScalarTypeNames.join(', ')} } from '../types';` : '',
    ]
      .filter(Boolean)
      .join('\n');

    const outDir = path.resolve(timetableApiDir, group.version);
    await fs.mkdir(outDir, { recursive: true });
    await fs.writeFile(path.resolve(outDir, 'schemas.ts'), `${header}\n\n${schemaString}\n`);

    console.log(`${group.version}: 경로 ${Object.keys(spec.paths ?? {}).length}개, 스키마 ${collected.length}개`);
  }
};

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
