import { Board, Direction } from '../types';
import { getValidDirs, moveSnake } from '../util';
import { b } from '../testutil';
const { DOWN, LEFT, RIGHT, UP } = Direction;

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
    [
      'two sneks',
      b`
      Y-X
      y--
      ---
      `,
      [DOWN, LEFT],
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
    [
      'eating food',
      b`
      -
      -
      .
      X
      `,
      [UP, UP, UP],
      b`
      X
      x
      -
      -
      X:98
      `,
    ],
  ])('%s', (_, board: Board, dir: Direction | Direction[], expected: Board) => {
    let res = board;
    if (Array.isArray(dir)) {
      dir.forEach(d => {
        res = moveSnake(res, 'X', d);
      });
    } else {
      res = moveSnake(res, 'X', dir);
    }
    expect(res).toEqual(expected);
  });
});
