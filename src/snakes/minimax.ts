import { Board, Direction } from './types';
import { getValidDirs, moveSnake } from './util';
import { flatten } from 'lodash';

function max(...args: number[]) {
  return args.reduce((p, c) => (c > p ? c : p));
}

function min(...args: number[]) {
  return args.reduce((p, c) => (c < p ? c : p));
}

// Given board and id, returns all board states after snake of id take a move
function doMoves(boards: Board[], id: string) {
  return flatten(
    boards.map(board => {
      const [snake] = board.snakes.filter(snake => snake.id === id);
      const currentPos = snake.body[0];
      const possibleDirs = getValidDirs(currentPos, board);
      console.log(possibleDirs);
      return possibleDirs.map(dir => ({
        newBoard: moveSnake(board, id, dir),
        dir,
      }));
    })
  );
}

export type Minimax = (
  board: Board,
  depth: number,
  maximizingPlayer: boolean,
  alpha: number,
  beta: number
) => [number, Direction | null];

export function createMinimax(heroId: string) {
  function currentPositionScore(board: Board) {
    // high number = good for maximizing player
    // 1 point for each food
    // -1 point for each opposing body length
    const score = board.snakes.reduce((p, c) => {
      if (c.id === heroId) {
        return p + c.body.length;
      } else {
        return p - c.body.length;
      }
    }, 0);
    return score;
  }

  function possiblePositions(board: Board, maximizingPlayer: boolean) {
    let movers = board.snakes.filter(s => {
      if (maximizingPlayer) return s.id === heroId;
      else return s.id !== heroId;
    });
    console.log({ movers });
    let res: {
      newBoard: Board;
      dir: Direction;
    }[] = [{ newBoard: board, dir: Direction.UP }];
    let boards = [board];
    while (movers.length > 0) {
      const [mover, ...rest] = movers;
      movers = rest;
      res = doMoves(boards, mover.id);
      boards = res.map(r => r.newBoard);
    }
    console.log({ res });
    return res;
  }

  /**
   * Finds best move at a given depth from a given board state
   * Implements alpha beta pruning
   * @param board Current board position
   * @param depth Current depth
   * @param alpha Best score maximizing player is assured of
   * @param beta Best score minimizing player is assured of
   * @param maximizingPlayer
   */

  const minimax: Minimax = (
    board,
    depth,
    // false means other player moves first, so we dont run into them
    maximizingPlayer,
    alpha,
    beta
  ) => {
    const [hero] = board.snakes.filter(snake => snake.id === heroId);
    const gameIsOver = (maximizingPlayer && !hero) || hero.health === 0;
    if (gameIsOver) {
      console.log('game is over');
      return [Number.NEGATIVE_INFINITY, null];
    }
    if (depth == 0) {
      console.log('depth 0');
      return [currentPositionScore(board), null];
    }

    if (maximizingPlayer) {
      let maxScore = Number.NEGATIVE_INFINITY;
      let bestDir: Direction | null = null;
      for (const { dir, newBoard } of possiblePositions(board, maximizingPlayer)) {
        const [score] = minimax(newBoard, depth - 1, false, alpha, beta);
        console.log({ maximizingPlayer, score, dir });
        if (score > maxScore) {
          bestDir = dir;
          maxScore = score;
        }
        alpha = max(alpha, score);
        if (beta <= alpha) break;
      }
      console.log(`${depth}|best: ${bestDir}`);
      return [maxScore, bestDir];
    } else {
      let minScore = Number.POSITIVE_INFINITY;
      let worstDir: Direction | null = null;
      for (const { newBoard, dir: badDir } of possiblePositions(board, maximizingPlayer)) {
        const [score, dir] = minimax(newBoard, depth - 1, true, alpha, beta);
        console.log({ maximizingPlayer, score, badDir });
        if (score < minScore) {
          worstDir = dir;
          minScore = score;
        }
        beta = min(beta, score);
        if (beta <= alpha) break;
      }
      console.log(`${depth}|worst: ${worstDir}`);
      return [minScore, worstDir];
    }
  };

  return (board: Board) =>
    minimax(board, 2, false, Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY);
}
