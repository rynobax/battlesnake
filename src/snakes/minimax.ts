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
      return possibleDirs.map(dir => moveSnake(board, id, dir));
    })
  );
}

export function createMinimax(heroId: string) {
  function currentPositionScore(board: Board) {
    // high number = good for maximizing player
    // 1 point for each food
    // -1 point for each opposing body length
    return board.snakes.reduce((p, c) => {
      if (c.id === heroId) {
        return p + c.body.length;
      } else {
        return p - c.body.length;
      }
    }, 0);
  }

  function possiblePositions(board: Board, maximizingPlayer: boolean) {
    let movers = board.snakes.filter(s => {
      if (maximizingPlayer) return s.id === heroId;
      else return s.id !== heroId;
    });
    let boards = [board];
    while (movers.length > 0) {
      const [mover, ...rest] = movers;
      movers = rest;
      boards = doMoves(boards, mover.id);
    }
    return boards;
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

  function minimax(
    board: Board,
    depth: number,
    maximizingPlayer: boolean,
    alpha: number = Number.NEGATIVE_INFINITY,
    beta: number = Number.POSITIVE_INFINITY
  ) {
    const [hero] = board.snakes.filter(snake => snake.id === heroId);
    const gameIsOver = hero.health === 0;
    if (gameIsOver) return Number.NEGATIVE_INFINITY;
    if (depth == 0) {
      return currentPositionScore(board);
    }

    if (maximizingPlayer) {
      let maxScore = Number.NEGATIVE_INFINITY;
      for (const child of possiblePositions(board, maximizingPlayer)) {
        const score = minimax(child, depth - 1, false, alpha, beta);
        maxScore = max(maxScore, score);
        alpha = max(alpha, score);
        if (beta <= alpha) break;
      }
      return maxScore;
    } else {
      let minScore = Number.POSITIVE_INFINITY;
      for (const child of possiblePositions(board, maximizingPlayer)) {
        const score = minimax(child, depth - 1, true, alpha, beta);
        minScore = min(minScore, score);
        beta = min(beta, score);
        if (beta <= alpha) break;
      }
      return minScore;
    }
  }

  return minimax;
}
