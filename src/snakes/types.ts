type HeadType =
  | 'beluga'
  | 'bendr'
  | 'dead'
  | 'evil'
  | 'fang'
  | 'pixel'
  | 'regular'
  | 'safe'
  | 'sand-worm'
  | 'shades'
  | 'silly'
  | 'smile'
  | 'tongue';

type TailType =
  | 'block-bum'
  | 'bolt'
  | 'curled'
  | 'fat-rattle'
  | 'freckled'
  | 'hook'
  | 'pixel'
  | 'regular'
  | 'round-bum'
  | 'sharp'
  | 'skinny'
  | 'small-rattle';

export enum Direction {
  UP = 'up',
  RIGHT = 'right',
  DOWN = 'down',
  LEFT = 'left',
}

export interface Position {
  x: number;
  y: number;
}

export interface Snake {
  id: string;
  name: string;
  health: number;
  body: Position[];
}

export interface Board {
  height: number;
  width: number;
  food: Position[];
  snakes: Snake[];
}

export interface Start {
  game: { id: string };
  turn: number;
  board: Board;
  you: Snake;
}

export interface StartRes {
  color: string;
  headType: HeadType;
  tailType: TailType;
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
  move: Direction;
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
