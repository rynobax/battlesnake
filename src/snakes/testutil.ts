import { Board } from './types';
import { nonNull } from './util';

import { uniq, flatten } from 'lodash';

const isUpper = (c: string) => c.toUpperCase() === c;
const notEmpty = (c: string) => c !== '-';
const notFood = (c: string) => c !== '.';

const tails: {
  [name: string]: string;
} = {
  A: 'b',
  X: 'y',
};

export function b(strs: TemplateStringsArray): Board {
  const str = strs[0];
  const trimmed = str
    .split('\n')
    .map(s => s.trim())
    .filter(s => !!s);
  const hps = trimmed.filter(s => s.includes(':'));
  const rows = trimmed.filter(s => !s.includes(':'));

  const hpMap: { [key: string]: number } = {};
  hps.forEach(s => {
    const key = s[0];
    const val = Number(s.slice(2));
    hpMap[key] = val;
  });

  const lens = rows.map(s => s.length);
  if (uniq(lens).length > 1) throw Error('Row length mismatch');
  const allChars: string[] = [];
  const coords: { x: number; y: number; c: string }[] = [];
  rows.forEach((row, y) => {
    row.split('').forEach((c, x) => {
      allChars.push(c);
      coords.push({ x, y, c });
    });
  });

  // Does body order matter?
  const snakes = allChars
    .filter(notEmpty)
    .filter(isUpper)
    .filter(notFood)
    .map(name => {
      const [head] = coords.filter(({ c }) => c === name);
      const body = coords.filter(({ c }) => c === name.toLowerCase());
      const [tailCoord] = coords.filter(({ c }) => c === tails[name]);
      const tail = [];
      if (tailCoord) tail.push(tailCoord, tailCoord);

      let health = 100;
      if (hpMap[name] !== undefined) health = hpMap[name];
      return {
        id: name,
        name,
        health,
        body: [head, ...body, ...tail].map(({ x, y }) => ({ x, y })),
      };
    });

  const food = flatten(
    rows.map((row, y) =>
      row.split('').map((c, x) => {
        if (c === '.') return { x, y };
        else return null;
      })
    )
  ).filter(nonNull);

  const height = rows.length;
  const width = rows[0].length;

  return {
    height,
    width,
    food,
    snakes,
  };
}
