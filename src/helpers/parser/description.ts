import { Description } from '@pm-types/local';
import { DefinitionsDescription } from '@pm-types/postman';

export function parseDescriptionToLocal(
  value: DefinitionsDescription
): Description {
  if (typeof value === 'string') {
    value = {
      content: value,
    };
  }
  const description: Description = {
    content: value?.content || '',
    type: value?.type,
  };
  return description;
}

export function parseDescriptionToPostman(
  value: Description
): DefinitionsDescription {
  if (typeof value === 'string') {
    value = {
      content: value,
    };
  }
  const description: DefinitionsDescription = {
    content: value.content,
    type: value?.type,
  };
  return description;
}
