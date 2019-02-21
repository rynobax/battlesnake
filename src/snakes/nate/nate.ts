import { random } from 'lodash';

import { Snek, Start, Move, MoveRes, StartRes, Direction, Board, Snake } from '../types';
import { getValidDirs } from '../util';

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

  constructor(body: Start) {
    super();
    this.board = body.board;
  }

  public start(body: Start): StartRes {
    return {
      color: '#75d7fa',
      headType: 'tongue',
      tailType: 'sharp',
    };
  }

  public move(body: Move): MoveRes {
    console.log(`TURN ${body.turn}`);
    const { board, you } = body;

    const moves = this.getValidMoves(board, you);
    const ndx = random(moves.length - 1);

    this.lastBoard = board;
    this.lastYou = you;

    return { move: moves[ndx] };
  }
}
