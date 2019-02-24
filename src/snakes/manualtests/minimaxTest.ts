import { createMinimax } from '../minimax';
import { b } from '../testutil';

const board = b`
-Aaa
--.-
-xx-
--X-
`;

const minimax = createMinimax('X');

const res = minimax(board);
console.log({ res });
