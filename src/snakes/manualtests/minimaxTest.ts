import { createMinimax } from '../minimax';
import { b } from '../testutil';

const board = b`
-X---.-
-x-----
-------
-------
-A-----
-a---f.
-----F-
`;

const minimax = createMinimax('X');

const res = minimax(board);
console.log({ res });
