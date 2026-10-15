/**
 * 손으로 쓴 v2 엔드포인트(src/apis/snutt-timetable/v2/index.ts)가 기록된 명세(specs/v2.json)와 맞는지 확인한다.
 * yarn generate:snutt-timetable 로 명세를 갱신한 뒤 실행한다. 어긋난 곳이 있으면 exit 1.
 *
 * 확인하는 것: 경로 · 메서드 존재, 경로 파라미터 이름, query 이름, 요청 body 타입, 응답 타입, 토큰 필요 여부
 */
import { OpenAPIV3_1 } from 'openapi-types';
import fs from 'fs/promises';
import path from 'path';
import { propertyToType } from '../generate/utils/propertyToType';

const packageRoot = path.resolve(__dirname, '../..');

type Operation = OpenAPIV3_1.OperationObject;

/** index.ts 의 엔드포인트 한 개. `'GET /v2/x/:id': ({ token, params }: {...}) => callWithToken<SuccessResponse<T>>({` */
type Endpoint = {
  key: string;
  method: string;
  path: string;
  args: string;
  withToken: boolean;
  response: string;
};

const ENDPOINT_PATTERN =
  /'(GET|POST|PUT|PATCH|DELETE) ([^']+)':\s*\(([\s\S]*?)\)\s*=>\s*call(WithToken|WithoutToken)<SuccessResponse<([\s\S]*?)>>\(/g;

const parseEndpoints = (source: string): Endpoint[] =>
  [...source.matchAll(ENDPOINT_PATTERN)].map(([, method, path, args, call, response]) => ({
    key: `${method} ${path}`,
    method,
    path,
    args,
    withToken: call === 'WithToken',
    response: normalize(response),
  }));

const normalize = (type: string) => type.replace(/\s+/g, ' ').trim();

/** `name: { a: string; b?: string }` 의 키 목록. 없으면 null */
const objectKeys = (args: string, name: string) => {
  const match = args.match(new RegExp(`\\b${name}\\??:\\s*\\{([^}]*)\\}`));
  if (!match) return null;
  return [...match[1].matchAll(/(\w+)\??:/g)].map(([, key]) => key).sort();
};

const bodyType = (args: string) => args.match(/\bbody\??:\s*(\w+)/)?.[1] ?? null;

const parameterNames = (operation: Operation, location: 'path' | 'query') =>
  (operation.parameters ?? [])
    .filter((p): p is OpenAPIV3_1.ParameterObject => !('$ref' in p) && p.in === location)
    .map((p) => p.name)
    .sort();

const requestBodyType = (operation: Operation) => {
  const body = operation.requestBody;
  if (!body || '$ref' in body) return null;
  const schema = Object.values(body.content)[0]?.schema;
  return schema ? propertyToType(schema, 'request') : null;
};

const responseType = (operation: Operation) => {
  const response = operation.responses?.['200'];
  if (!response || '$ref' in response) return 'never';
  const schema = response.content && Object.values(response.content)[0]?.schema;
  return schema ? propertyToType(schema, 'response') : 'never';
};

const needsToken = (operation: Operation) => (operation.security ?? []).some((requirement) => 'bearer' in requirement);

const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);

const run = async () => {
  const spec: OpenAPIV3_1.Document = JSON.parse(await fs.readFile(path.resolve(packageRoot, 'specs/v2.json'), 'utf-8'));
  const source = await fs.readFile(path.resolve(packageRoot, 'src/apis/snutt-timetable/v2/index.ts'), 'utf-8');
  const endpoints = parseEndpoints(source);

  const problems: string[] = [];
  for (const endpoint of endpoints) {
    const specPath = endpoint.path.replace(/:(\w+)/g, '{$1}');
    const operation = spec.paths?.[specPath]?.[endpoint.method.toLowerCase() as OpenAPIV3_1.HttpMethods];
    const report = (message: string) => problems.push(`${endpoint.key}\n    ${message}`);

    if (!operation) {
      report('명세에 없는 엔드포인트');
      continue;
    }

    const pathParams = parameterNames(operation, 'path');
    const actualPathParams = objectKeys(endpoint.args, 'params') ?? [];
    if (!same(pathParams, actualPathParams)) report(`경로 파라미터: 명세 ${pathParams} / 코드 ${actualPathParams}`);

    const queryParams = parameterNames(operation, 'query');
    const actualQueryParams = objectKeys(endpoint.args, 'query') ?? [];
    if (!same(queryParams, actualQueryParams)) report(`query: 명세 [${queryParams}] / 코드 [${actualQueryParams}]`);

    const expectedBody = requestBodyType(operation);
    const actualBody = bodyType(endpoint.args);
    if (expectedBody !== actualBody) report(`body: 명세 ${expectedBody} / 코드 ${actualBody}`);

    const expectedResponse = responseType(operation);
    if (expectedResponse !== endpoint.response) report(`응답: 명세 ${expectedResponse} / 코드 ${endpoint.response}`);

    if (needsToken(operation) !== endpoint.withToken)
      report(
        `토큰: 명세 ${needsToken(operation) ? '필요' : '불필요'} / 코드 ${endpoint.withToken ? 'callWithToken' : 'callWithoutToken'}`,
      );
  }

  console.log(`엔드포인트 ${endpoints.length}개 확인 (명세 전체 ${Object.keys(spec.paths ?? {}).length}개 경로)`);
  if (problems.length > 0) {
    console.log(`\n어긋난 곳 ${problems.length}개:\n`);
    console.log(problems.join('\n'));
    process.exit(1);
  }
  console.log('모두 명세와 맞습니다.');
};

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
