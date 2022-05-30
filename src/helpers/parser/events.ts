import { Itens } from '@pm-types/local';
import { EventList, Event } from '@pm-types/postman';

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

export function parseEventToPostman(name: string, value: string): Event | void {
  let listen: string;
  if (name === 'prerequest.js') {
    listen = 'prerequest';
  } else if (name === 'test.js') {
    listen = 'test';
  } else {
    return;
  }
  return {
    listen,
    script: {
      exec: value,
      type: 'text/javascript',
    },
  };
}
