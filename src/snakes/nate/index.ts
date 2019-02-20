import { Snek, Start, Move, MoveRes, StartRes } from '../index';

export default class Nate extends Snek {
  public start(body: Start): StartRes {
    return {
      color: '#ff00ff',
      headType: 'bendr',
      tailType: 'pixel'
    };
  }

  public move(body: Move): MoveRes {
    return {
      move: 'right'
    };
  }
}
