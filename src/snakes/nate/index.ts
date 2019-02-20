import { random } from 'lodash';

import { Snek, Start, Move, MoveRes, StartRes, Direction } from '../index';

const { DOWN, LEFT, RIGHT, UP } = Direction;

export default class Nate extends Snek {
  public start(body: Start): StartRes {
    return {
      color: '#75d7fa',
      headType: "beluga",
      tailType: 
    };
  }

  public move(body: Move): MoveRes {
    const moves = [DOWN, LEFT, RIGHT, UP];
    const ndx = random(3);
    return { move: moves[ndx] };
  }
}
