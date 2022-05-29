import { Parameter } from '@pm-types/local';
import { Header1, HeaderList } from '@pm-types/postman';
import { parseVariableToLocal } from '@helpers/parser/variables';

export function parseHeaderToLocal(
  value: HeaderList | Header1 | string
): Parameter[] {
  if (typeof value === 'string') {
    throw Error('unmapped conversion from string to local header');
  }
  return value.map(parseVariableToLocal);
}
