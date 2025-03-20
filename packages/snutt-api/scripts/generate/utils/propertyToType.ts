import { OpenAPIV3 } from 'openapi-types';
import { toPascalCase } from './case';

const requiredKeys = ['id', '_id'];

export const propertyToType = (property: OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject): string => {
  if ('$ref' in property) {
    const last = property.$ref.split('/').at(-1);
    if (!last) throw new Error();
    return last;
  }

  if (property.type === 'array') return `${propertyToType(property.items)}[]`;

  if (property.type === 'integer' || property.type === 'number' || property.type === 'string') {
    if (property.enum) return property.enum.map((e) => (!isNaN(Number(e)) ? e : `'${e}'`)).join(' | ');
    if (property.format) {
      if (['int32', 'int64'].includes(property.format)) return 'Integer';

      return toPascalCase(property.format);
    }
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
      .map(([key, value]) => {
        const type = propertyToType(value);

        return `${key}${property.required?.includes(key) || requiredKeys.includes(key) ? '' : '?'}: ${type}`;
      })
      .join('; ')} }`;
  }

  throw new Error(JSON.stringify(property));
};
