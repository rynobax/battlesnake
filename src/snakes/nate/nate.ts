import { random } from 'lodash';

import { Snek, Start, Move, MoveRes, StartRes, Direction } from '../types';
const { DOWN, LEFT, RIGHT, UP } = Direction;

export default class Nate extends Snek {
  public start(body: Start): StartRes {
    return {
      color: '#75d7fa',
      headType: 'beluga',
      tailType: 'freckled',
    };
  }

  public move(body: Move): MoveRes {
    const moves = [DOWN, LEFT, RIGHT, UP];
    const ndx = random(3);
    console.log(ndx);
    return { move: moves[ndx] };
  }
}
