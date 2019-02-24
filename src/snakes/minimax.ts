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
      return possibleDirs.map(dir => ({
        newBoard: moveSnake(board, id, dir),
        dir,
      }));
    })
  );
}

type Minimax = (
  board: Board,
  depth: number,
  maximizingPlayer: boolean,
  alpha: number,
  beta: number
) => [number, Direction | null];

export type MinimaxFn = (board: Board) => [number, Direction | null];

// Depth should be even
const MAX_DEPTH = 6;
const DEATH_OFFSET = -10000;

export function createMinimax(heroId: string) {
  function currentPositionScore(board: Board) {
    // high number = good for maximizing player
    // 1 point for each food
    // -1 point for each opposing body length
    let score = board.snakes.reduce((p, c) => {
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
    return res;
  }

  // let currentMoves: Direction[] = [];

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
    // console.log(`*** DEPTH ${depth} ***`)
    const [hero] = board.snakes.filter(snake => snake.id === heroId);
    const gameIsOver = !hero || hero.health === 0;
    if (gameIsOver) {
      // console.log('game is over');
      return [DEATH_OFFSET + (MAX_DEPTH - depth), null];
    }
    if (depth == 0) {
      // console.log('depth 0');
      return [currentPositionScore(board), null];
    }

    if (maximizingPlayer) {
      let maxScore = Number.NEGATIVE_INFINITY;
      let bestDir: Direction | null = null;
      for (const { dir, newBoard } of possiblePositions(board, maximizingPlayer)) {
        if (!bestDir) bestDir = dir;
        // if(depth === MAX_DEPTH || depth === MAX_DEPTH - 1) console.log('@@@@@@');
        // console.log(`Hero turning ${dir}`);
        // currentMoves.push(dir);
        // console.log(currentMoves);
        const [score] = minimax(newBoard, depth - 1, false, alpha, beta);
        if (depth === MAX_DEPTH || depth === MAX_DEPTH - 1)
          console.log(`${dir}: ${score}  (max: ${maxScore})`);
        // currentMoves.pop();
        // console.log({ maximizingPlayer, score, dir });
        if (score > maxScore) {
          bestDir = dir;
          maxScore = score;
        }
        alpha = max(alpha, score);
        if (beta <= alpha) break;
      }
      // console.log(`${depth}|best: ${bestDir} - ${maxScore}`);

      return [maxScore, bestDir];
    } else {
      let minScore = Number.POSITIVE_INFINITY;
      let worstDir: Direction | null = null;
      for (const { newBoard, dir: badDir } of possiblePositions(board, maximizingPlayer)) {
        if (!worstDir) worstDir = badDir;
        // console.log(`Opponent turning ${badDir}`);
        const [score, dir] = minimax(newBoard, depth - 1, true, alpha, beta);
        // console.log({ maximizingPlayer, score, badDir });
        if (score < minScore) {
          worstDir = dir;
          minScore = score;
        }
        beta = min(beta, score);
        if (beta <= alpha) break;
      }
      // console.log(`${depth}|worst: ${worstDir} - ${minScore}`);
      return [minScore, worstDir];
    }
  };

  return (board: Board) =>
    minimax(board, MAX_DEPTH, false, Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY);
}
