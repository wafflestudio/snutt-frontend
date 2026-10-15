/**
 * 기록된 명세(specs/<버전>.json)가 git 의 이전 버전과 비교해 무엇이 바뀌었는지 요약한다.
 * yarn generate:snutt-timetable 로 명세를 갱신한 뒤 실행한다.
 *
 * yarn diff:snutt-timetable          # HEAD 와 비교
 * yarn diff:snutt-timetable origin/main
 */
import { OpenAPIV3_1 } from 'openapi-types';
import { execFileSync } from 'child_process';
import fs from 'fs/promises';
import path from 'path';

const packageRoot = path.resolve(__dirname, '../..');
const VERSIONS = ['v1', 'v2'] as const;

type Document = OpenAPIV3_1.Document;
type Operation = OpenAPIV3_1.OperationObject;
type Schema = OpenAPIV3_1.SchemaObject;

const readAt = (ref: string, version: string): Document => {
  const file = path.relative(
    execFileSync('git', ['rev-parse', '--show-toplevel'], { cwd: packageRoot }).toString().trim(),
    path.resolve(packageRoot, `specs/${version}.json`),
  );
  return JSON.parse(
    execFileSync('git', ['show', `${ref}:${file}`], { cwd: packageRoot, maxBuffer: 64 * 1024 * 1024 }).toString(),
  );
};

const operations = (spec: Document) => {
  const result = new Map<string, Operation>();
  for (const [route, item] of Object.entries(spec.paths ?? {}))
    for (const [method, operation] of Object.entries(item ?? {}))
      if (operation && typeof operation === 'object' && 'responses' in operation)
        result.set(`${method.toUpperCase()} ${route}`, operation as Operation);
  return result;
};

/** 비교할 부분만 뽑는다. 설명 · 예시 같은 문구 변경은 무시한다 */
const summarize = (operation: Operation) => ({
  parameters: (operation.parameters ?? []).map((p) =>
    '$ref' in p ? p.$ref : `${p.name}(${p.in}${p.required ? ', 필수' : ''}): ${JSON.stringify(p.schema)}`,
  ),
  body: JSON.stringify(
    operation.requestBody && !('$ref' in operation.requestBody)
      ? Object.values(operation.requestBody.content)[0]?.schema
      : operation.requestBody,
  ),
  responses: JSON.stringify(
    Object.fromEntries(
      Object.entries(operation.responses ?? {}).map(([code, response]) => [
        code,
        '$ref' in response ? response.$ref : response.content && Object.values(response.content)[0]?.schema,
      ]),
    ),
  ),
  security: JSON.stringify(operation.security),
});

const stringify = (value: unknown) => JSON.stringify(value) ?? 'undefined';

const diffSchema = (before: Schema, after: Schema) => {
  const lines: string[] = [];
  const beforeProps = (before.properties ?? {}) as Record<string, unknown>;
  const afterProps = (after.properties ?? {}) as Record<string, unknown>;
  const beforeRequired = new Set(before.required ?? []);
  const afterRequired = new Set(after.required ?? []);

  for (const key of Object.keys(afterProps))
    if (!(key in beforeProps)) lines.push(`+ ${key}: ${stringify(afterProps[key])}`);
  for (const key of Object.keys(beforeProps)) if (!(key in afterProps)) lines.push(`- ${key}`);
  for (const key of Object.keys(afterProps)) {
    if (!(key in beforeProps)) continue;
    if (stringify(beforeProps[key]) !== stringify(afterProps[key]))
      lines.push(`~ ${key}: ${stringify(beforeProps[key])} → ${stringify(afterProps[key])}`);
    if (beforeRequired.has(key) !== afterRequired.has(key))
      lines.push(`~ ${key}: ${afterRequired.has(key) ? '필수가 됨' : '필수가 아니게 됨'}`);
  }
  const { properties: _a, required: _b, ...beforeRest } = before;
  const { properties: _c, required: _d, ...afterRest } = after;
  if (stringify(beforeRest) !== stringify(afterRest))
    lines.push(`~ ${stringify(beforeRest)} → ${stringify(afterRest)}`);
  return lines;
};

const run = async () => {
  const ref = process.argv[2] ?? 'HEAD';

  for (const version of VERSIONS) {
    const before = readAt(ref, version);
    const after: Document = JSON.parse(await fs.readFile(path.resolve(packageRoot, `specs/${version}.json`), 'utf-8'));
    const out: string[] = [];

    const beforeOps = operations(before);
    const afterOps = operations(after);
    for (const key of afterOps.keys()) if (!beforeOps.has(key)) out.push(`+ ${key}`);
    for (const key of beforeOps.keys()) if (!afterOps.has(key)) out.push(`- ${key}`);
    for (const [key, operation] of afterOps) {
      const previous = beforeOps.get(key);
      if (!previous) continue;
      const [a, b] = [summarize(previous), summarize(operation)];
      for (const field of Object.keys(b) as (keyof typeof b)[])
        if (stringify(a[field]) !== stringify(b[field]))
          out.push(`~ ${key} ${field}\n    이전 ${stringify(a[field])}\n    이후 ${stringify(b[field])}`);
    }

    const beforeSchemas = (before.components?.schemas ?? {}) as Record<string, Schema>;
    const afterSchemas = (after.components?.schemas ?? {}) as Record<string, Schema>;
    for (const name of Object.keys(afterSchemas)) if (!beforeSchemas[name]) out.push(`+ 스키마 ${name}`);
    for (const name of Object.keys(beforeSchemas)) if (!afterSchemas[name]) out.push(`- 스키마 ${name}`);
    for (const [name, schema] of Object.entries(afterSchemas)) {
      if (!beforeSchemas[name]) continue;
      const lines = diffSchema(beforeSchemas[name], schema);
      if (lines.length > 0) out.push(`~ 스키마 ${name}\n    ${lines.join('\n    ')}`);
    }

    console.log(`== ${version} (${ref} 대비): 엔드포인트 ${beforeOps.size} → ${afterOps.size}`);
    console.log(out.length > 0 ? out.join('\n') : '바뀐 것 없음');
    console.log();
  }
};

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
