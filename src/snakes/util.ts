import { difference } from 'lodash';

import { Position, Direction, Board } from './types';
const { DOWN, LEFT, RIGHT, UP } = Direction;

export function nonNull<T>(value: T | null): value is T {
  return value !== null;
}

export const ALL_DIRS = [DOWN, LEFT, RIGHT, UP];

const OFFSETS = {
  [UP]: { x: 0, y: -1 },
  [DOWN]: { x: 0, y: 1 },
  [LEFT]: { x: -1, y: 0 },
  [RIGHT]: { x: 1, y: 0 },
};

/*
+---+---+
|0,0|1,0|
+---+---+
|0,1|1,1|
+---+---+
*/

export function getDir(initial: Position, next: Position) {
  const xDiff = next.x - initial.x;
  const yDiff = next.y - initial.y;

  if (xDiff > 0) return RIGHT;
  if (xDiff < 0) return LEFT;
  if (yDiff < 0) return UP;
  if (yDiff > 0) return DOWN;

  throw Error(`Unable to find dir from ${initial} and ${next}`);
}

export function getAdjacentDirs(dir: Direction) {
  switch (dir) {
    case Direction.UP:
      return [LEFT, UP, RIGHT];
    case Direction.DOWN:
      return [RIGHT, DOWN, LEFT];
    case Direction.LEFT:
      return [DOWN, LEFT, UP];
    case Direction.RIGHT:
      return [UP, RIGHT, DOWN];
  }
}

export function getValidDirs(pos: Position, board: Board) {
  const { x, y } = pos;
  const { width, height } = board;
  const atRightEdge = x === width - 1;
  const atLeftEdge = x === 0;
  const atBottomEdge = y === height - 1;
  const atTopEdge = y === 0;

  // Can't run into edge
  const illegalDirs: Direction[] = [];
  if (atRightEdge) illegalDirs.push(RIGHT);
  if (atLeftEdge) illegalDirs.push(LEFT);
  if (atTopEdge) illegalDirs.push(UP);
  if (atBottomEdge) illegalDirs.push(DOWN);

  // Can't run into another snake
  // TODO: You can go where there tail currently is
  // TODO: Anticipate them picking up food

  const validDirs = difference(ALL_DIRS, illegalDirs).filter(dir => {
    const newPos = move(pos, dir);

    // Filter if at least one snake is on the space we would move to
    const spaceIsBlocked = board.snakes.some(snake => snake.body.some(p => eql(p, newPos)));
    return !spaceIsBlocked;
  });

  return validDirs;
}

function move(pos: Position, dir: Direction) {
  const { x, y } = pos;
  const offset = OFFSETS[dir];
  return { x: x + offset.x, y: y + offset.y };
}

function eql(pos1: Position, pos2: Position) {
  return pos1.x === pos2.x && pos1.y === pos2.y;
}

function checkForCrash(board: Board, pos: Position) {
  // Collision with snake
  if (board.snakes.some(snake => snake.body.some(body => eql(body, pos)))) return true;
  // Collision with wall
  if (pos.x < 0 || pos.x >= board.width || pos.y < 0 || pos.y >= board.height) return true;
  return false;
}

function checkForFoodPickup(board: Board, pos: Position) {
  return board.food.some(f => eql(f, pos));
}

// TODO: Change health
//  Food
//  Death
// TODO: Tail when picking up stuff
export function moveSnake(board: Board, id: string, dir: Direction): Board {
  return {
    ...board,
    snakes: board.snakes
      .map(snake => {
        if (snake.id !== id) return snake;
        const [head] = snake.body;
        const [tail, ...rest] = [...snake.body].reverse();
        const newHead = move(head, dir);
        let body = [newHead, ...rest.reverse()];
        if (checkForCrash(board, newHead)) return null;
        if (checkForFoodPickup(board, newHead)) {
          body.push(tail);
          return { ...snake, body: body, health: 100 };
        }
        // TODO: Do you die on 1 hp or 0 hp?
        if (snake.health === 1) return null;
        return { ...snake, body: body, health: snake.health - 1 };
      })
      .filter(nonNull),
  };
}
