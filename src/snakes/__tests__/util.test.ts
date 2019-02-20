import { Board, Direction } from '../types';
import { getValidDirs } from '../util';
const { DOWN, LEFT, RIGHT, UP } = Direction;

import { uniq } from 'lodash';

const isUpper = (c: string) => c.toUpperCase() === c;
const notEmpty = (c: string) => c !== '-';

function b(strs: TemplateStringsArray): Board {
  const str = strs[0];
  const rows = str
    .split('\n')
    .map(s => s.trim())
    .filter(s => !!s);
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
    .map(name => {
      const [head] = coords.filter(({ c }) => c === name);
      const body = coords.filter(({ c }) => c === name.toLowerCase());
      return {
        id: name,
        name,
        health: 1,
        body: [head, ...body].map(({ x, y }) => ({ x, y })),
      };
    });

  const height = rows.length;
  const width = rows[0].length;

  return {
    height,
    width,
    food: [],
    snakes,
  };
}

it('b works', () => {
  const board = b`
  Xx-
  -Y-
  -y-
  `;
  expect(board).toEqual({
    height: 3,
    width: 3,
    food: [],
    snakes: [
      {
        id: 'X',
        name: 'X',
        health: 1,
        body: [{ x: 0, y: 0 }, { x: 1, y: 0 }],
      },
      {
        id: 'Y',
        name: 'Y',
        health: 1,
        body: [{ x: 1, y: 1 }, { x: 1, y: 2 }],
      },
    ],
  });
});

describe('getValidDirs', () => {
  test.each([
    [
      'free',
      b`
      ---
      -X-
      ---
      `,
      [UP, DOWN, LEFT, RIGHT],
    ],
    [
      'left wall',
      b`
      ---
      X--
      ---
      `,
      [UP, DOWN, RIGHT],
    ],
    [
      'Right wall',
      b`
      ---
      --X
      ---
      `,
      [UP, DOWN, LEFT],
    ],
    [
      'Top wall',
      b`
      -X-
      ---
      ---
      `,
      [DOWN, RIGHT, LEFT],
    ],
    [
      'Bottom wall',
      b`
      ---
      ---
      -X-
      `,
      [UP, RIGHT, LEFT],
    ],
    [
      'Top right corner',
      b`
      --X
      ---
      ---
      `,
      [DOWN, LEFT],
    ],
    [
      'Snake',
      b`
      -Y--
      -yX-
      -y--
      `,
      [RIGHT, UP, DOWN],
    ],
    [
      'Avoids body',
      b`
      -xx-
      -xX-
      ----
      `,
      [RIGHT, DOWN],
    ],
  ])('%s', (_, board: Board, expected) => {
    const [snake] = board.snakes.filter(s => s.name === 'X');
    const head = snake.body[0];
    expect(getValidDirs(head, board).sort()).toEqual(expected.sort());
  });
});
