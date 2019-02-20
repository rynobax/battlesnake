import nate from './nate';

interface Position {
  x: number;
  y: number;
}

interface Snake {
  id: string;
  name: string;
  health: number;
  body: Position[];
}

interface Board {
  height: number;
  width: number;
  food: Position[];
  snakes: Snake[];
}

export interface Start {
  game: { id: string };
  turn: number;
  board: Board;
  you: Snake
}

export interface StartRes {
  color: string;
  headType: string;
  tailType: string;
}

export interface Move {
  game: {
    id: string;
  };
  turn: number;
  board: Board;
  you: Snake;
}

export interface MoveRes {
  move: 'up' | 'down' | 'left' | 'right';
}

export interface End {
  game: {
    id: string;
  };
}

export abstract class Snek {
  public abstract start(body: Start): StartRes;
  public abstract move(body: Move): MoveRes;
}

export default {
  nate
};
