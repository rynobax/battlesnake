import { createMinimax } from '../minimax';
import { b } from './util.test';

const board = b`
-X.
-x-
---
`;

const minimax = createMinimax('X');

minimax(board);
