import { createMinimax } from '../minimax';
import { b } from '../testutil';

const board = b`
X-Y
x-y
-.-
`;

const minimax = createMinimax('X');

const res = minimax(board);
console.log(res);
