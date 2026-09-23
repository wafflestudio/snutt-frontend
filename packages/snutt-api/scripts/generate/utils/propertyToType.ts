import { OpenAPIV3_1 } from 'openapi-types';
import { toPascalCase } from './case';

// Date 는 JS 전역 타입과 겹치므로 별도 이름으로 매핑
const formatTypeNames: Record<string, string> = { date: 'LocalDate' };

export const formatToTypeName = (format: string) => formatTypeNames[format] ?? toPascalCase(format);

export const propertyToType = (property: OpenAPIV3_1.SchemaObject | OpenAPIV3_1.ReferenceObject): string => {
  if ('$ref' in property) {
    const last = property.$ref.split('/').at(-1);
    if (!last) throw new Error();
    return last;
  }

  const union = property.oneOf ?? property.anyOf;
  if (union) return union.map(propertyToType).join(' | ');

  // OpenAPI 3.1: nullable 은 type: ['string', 'null'] 형태로 표현됨
  if (Array.isArray(property.type))
    return property.type
      .map((type) => (type === 'null' ? 'null' : propertyToType({ ...property, type } as OpenAPIV3_1.SchemaObject)))
      .join(' | ');

  if (property.type === 'null') return 'null';

  if (property.type === 'array') {
    const itemType = propertyToType(property.items);
    // union 은 괄호로 감싸야 배열 전체가 union 의 배열이 된다 ('a' | 'b'[] 가 아니라 ('a' | 'b')[])
    return itemType.includes(' | ') ? `(${itemType})[]` : `${itemType}[]`;
  }

  if (property.type === 'integer' || property.type === 'number' || property.type === 'string') {
    if (property.enum) return property.enum.map((e) => (!isNaN(Number(e)) ? e : `'${e}'`)).join(' | ');
    if (property.format) return formatToTypeName(property.format);
    return 'string';
  }

  if (property.type === 'boolean') return 'boolean';

  if (property.type === 'object') {
    if (!property.properties) {
      if (property.additionalProperties !== undefined)
        return `Record<string, ${typeof property.additionalProperties === 'boolean' ? 'boolean' : propertyToType(property.additionalProperties)}>`;
      return 'Record<string, never>';
    }

    return `{ ${Object.entries(property.properties)
      .map(([key, value]) => `${key}${property.required?.includes(key) ? '' : '?'}: ${propertyToType(value)}`)
      .join('; ')} }`;
  }

  throw new Error(JSON.stringify(property));
};
