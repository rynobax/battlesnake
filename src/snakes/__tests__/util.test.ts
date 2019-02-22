import { Board, Direction } from '../types';
import { getValidDirs, moveSnake, nonNull } from '../util';
const { DOWN, LEFT, RIGHT, UP } = Direction;

import { uniq, flatten } from 'lodash';

const isUpper = (c: string) => c.toUpperCase() === c;
const notEmpty = (c: string) => c !== '-';
const isFood = (c: string) => c === '.';
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

describe('b tag', () => {
  it('basic', () => {
    const board = b`
    Xx-
    -A-
    -a.
    `;
    expect(board).toEqual({
      height: 3,
      width: 3,
      food: [{ x: 2, y: 2 }],
      snakes: [
        {
          id: 'X',
          name: 'X',
          health: 100,
          body: [{ x: 0, y: 0 }, { x: 1, y: 0 }],
        },
        {
          id: 'A',
          name: 'A',
          health: 100,
          body: [{ x: 1, y: 1 }, { x: 1, y: 2 }],
        },
      ],
    });
  });

  it('tail', () => {
    const board = b`
    Xxy
    -A-
    -ab
    `;
    expect(board).toEqual({
      height: 3,
      width: 3,
      food: [],
      snakes: [
        {
          id: 'X',
          name: 'X',
          health: 100,
          body: [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }, { x: 2, y: 0 }],
        },
        {
          id: 'A',
          name: 'A',
          health: 100,
          body: [{ x: 1, y: 1 }, { x: 1, y: 2 }, { x: 2, y: 2 }, { x: 2, y: 2 }],
        },
      ],
    });
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
      -A--
      -aX-
      -a--
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

describe('moveSnake', () => {
  test.each([
    [
      'basic move',
      b`
      ---
      -X-
      -x-
      `,
      UP,
      b`
      -X-
      -x-
      ---
      X:99
      `,
    ],
    [
      'turn',
      b`
      ---
      -X-
      -x-
      `,
      RIGHT,
      b`
      ---
      -xX
      ---
      X:99
      `,
    ],
    [
      'death into right wall',
      b`
      ---
      -xX
      ---
      `,
      RIGHT,
      b`
      ---
      ---
      ---
      `,
    ],
    [
      'death into left wall',
      b`
      ---
      Xx-
      ---
      `,
      LEFT,
      b`
      ---
      ---
      ---
      `,
    ],
    [
      'death into top wall',
      b`
      -X-
      -x-
      ---
      `,
      UP,
      b`
      ---
      ---
      ---
      `,
    ],
    [
      'death into bottom wall',
      b`
      ---
      -x-
      -X-
      `,
      DOWN,
      b`
      ---
      ---
      ---
      `,
    ],
    [
      'death into snake',
      b`
      aaA
      -X-
      -x-
      `,
      UP,
      b`
      aaA
      ---
      ---
      `,
    ],
  ])('%s', (_, board: Board, dir: Direction, expected: Board) => {
    expect(moveSnake(board, 'X', dir)).toEqual(expected);
  });
});
