import { random } from 'lodash';

import { Snek, Start, Move, MoveRes, StartRes, Board, Snake, Direction } from '../types';
import { createMinimax, MinimaxFn } from '../minimax';

/**
 * Priorities:
 *  Pick up food
 *  Trap other snakes
 *  Aim for empty areas of board
 */

export default class Nate extends Snek {
  board: Board;
  lastBoard: Board | null = null;
  lastYou: Snake | null = null;
  minimax: MinimaxFn;

  constructor(body: Start) {
    super();
    this.board = body.board;
    this.minimax = createMinimax(body.you.id);
  }

  public start(body: Start): StartRes {
    return {
      // color: '#75d7fa',
      headType: 'tongue',
      tailType: 'sharp',
    };
  }

  public move(body: Move): MoveRes {
    const { board, you } = body;
    console.log(`TURN ${body.turn}`);

    console.time('minimax');
    // depth must be odd or it will return null
    let [score, move] = this.minimax(board);
    console.timeEnd('minimax');
    if (!move) console.log('Minimax did not return a move, moving up!');
    move = Direction.UP;
    console.log(`Move ${move} has score ${score}`);

    this.lastBoard = board;
    this.lastYou = you;

    return { move };
  }
}
