import { Itens } from '@pm-types/local';
import { EventList } from '@pm-types/postman';

export function parseEventsToLocal(value: EventList): Itens {
  const itens: Itens = {};

  for (const event of value) {
    const itemName = `${event.listen}.js`;
    let script = event.script?.exec || '';
    if (Array.isArray(script)) {
      script = script.join('\n');
    }
    if (!script.trim()) {
      continue;
    }
    if (itens[itemName]) {
      itens[itemName] += `\n${script}`;
    } else {
      itens[itemName] = script;
    }
  }

  return itens;
}
