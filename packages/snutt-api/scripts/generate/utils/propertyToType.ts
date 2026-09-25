import { OpenAPIV3_1 } from 'openapi-types';
import { toPascalCase } from './case';

type Schema = OpenAPIV3_1.SchemaObject | OpenAPIV3_1.ReferenceObject;

/**
 * 필드가 항상 존재하는지 판단하는 기준.
 * 백엔드 명세 대부분에 required 가 빠져 있어서, required 가 없을 때는 다음 규칙을 쓴다.
 * - response: 응답에 쓰이는 스키마. null 이 될 수 없는 필드는 항상 온다고 본다 (Kotlin non-null)
 * - request: 요청에만 쓰이는 스키마. 기본값이 있어 생략 가능한 필드가 있으므로 모두 optional
 */
export type Presence = 'response' | 'request';

// Date 는 JS 전역 타입과 겹치므로 별도 이름으로 매핑
const formatTypeNames: Record<string, string> = { date: 'LocalDate' };

export const formatToTypeName = (format: string) => formatTypeNames[format] ?? toPascalCase(format);

export const isNullable = (schema: Schema) => {
  if ('$ref' in schema) return false;
  if (Array.isArray(schema.type)) return schema.type.includes('null');
  if (schema.type === 'null') return true;
  return (schema.oneOf ?? schema.anyOf ?? []).some((s) => !('$ref' in s) && s.type === 'null');
};

const getRequiredKeys = (schema: OpenAPIV3_1.SchemaObject, presence: Presence) => {
  if (schema.required) return schema.required;
  if (presence === 'request') return [];
  return Object.entries(schema.properties ?? {})
    .filter(([, value]) => !isNullable(value))
    .map(([key]) => key);
};

export const propertyToType = (property: Schema, presence: Presence): string => {
  const toType = (schema: Schema) => propertyToType(schema, presence);

  if ('$ref' in property) {
    const last = property.$ref.split('/').at(-1);
    if (!last) throw new Error();
    return last;
  }

  const union = property.oneOf ?? property.anyOf;
  if (union) return union.map(toType).join(' | ');

  // OpenAPI 3.1: nullable 은 type: ['string', 'null'] 형태로 표현됨
  if (Array.isArray(property.type))
    return property.type
      .map((type) => (type === 'null' ? 'null' : toType({ ...property, type } as OpenAPIV3_1.SchemaObject)))
      .join(' | ');

  if (property.type === 'null') return 'null';

  if (property.type === 'array') {
    const itemType = toType(property.items);
    // union 은 괄호로 감싸야 배열 전체가 union 의 배열이 된다 ('a' | 'b'[] 가 아니라 ('a' | 'b')[])
    return itemType.includes(' | ') ? `(${itemType})[]` : `${itemType}[]`;
  }

  if (property.type === 'integer' || property.type === 'number' || property.type === 'string') {
    if (property.enum) return property.enum.map((e) => (!isNaN(Number(e)) ? e : `'${e}'`)).join(' | ');
    if (property.format) return formatToTypeName(property.format);
    return property.type === 'string' ? 'string' : 'number';
  }

  if (property.type === 'boolean') return 'boolean';

  if (property.type === 'object' || (property.type === undefined && property.properties)) {
    if (!property.properties) {
      if (property.additionalProperties !== undefined)
        return `Record<string, ${typeof property.additionalProperties === 'boolean' ? 'unknown' : toType(property.additionalProperties)}>`;
      return 'Record<string, unknown>';
    }

    const required = getRequiredKeys(property, presence);
    return `{ ${Object.entries(property.properties)
      .map(([key, value]) => `${key}${required.includes(key) ? '' : '?'}: ${toType(value)}`)
      .join('; ')} }`;
  }

  // 타입 정보가 없는 스키마 (예: 임의 JSON)
  if (property.type === undefined) return 'unknown';

  throw new Error(JSON.stringify(property));
};
