import * as bodyParser from 'body-parser';
import * as express from 'express';
import * as logger from 'morgan';

import snakes from './snakes';
import { Start, Move, End, Snek, Direction } from './snakes/types';

const app = express();

// For deployment to Heroku, the port needs to be set using ENV, so
// we check for the port number in process.env
app.set('port', process.env.PORT || 9001);

app.enable('verbose errors');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use((_, res, next) => {
  res.setHeader('X-Powered-By', 'Battlesnake');
  next();
});

interface StartRequest extends Express.Request {
  body: Start;
}

interface MoveRequest extends Express.Request {
  body: Move;
}

interface EndRequest extends Express.Request {
  body: End;
}

Object.entries(snakes).forEach(([name, Snake]) => {
  const games = new Map<string, Snek>();

  app.post(`/${name}/start`, (request: StartRequest, response) => {
    const { id } = request.body.game;
    console.log(`New game ${id}`);
    const snake = new Snake(request.body);
    games.set(id, snake);
    const res = snake.start(request.body);
    return response.json(res);
  });

  app.post(`/${name}/move`, (request: MoveRequest, response) => {
    // These are pings I think
    if (request.body.you.id === 'you') return response.json({ move: Direction.UP });

    console.log(JSON.stringify(request.body, null, 2));
    const { id } = request.body.game;
    const snake = games.get(id);
    if (!snake) throw Error(`Could not find snake for game ${id}!`);
    const res = snake.move(request.body);
    return response.json(res);
  });

  app.post(`/${name}/end`, (request: EndRequest, response) => {
    const { id } = request.body.game;
    games.delete(id);
    return response.json({ gg: true });
  });

  app.post(`/${name}/ping`, (_, response) => {
    return response.json({ who: 'dat' });
  });
});

app.use('*', (req, res, next) => {
  console.dir(req.baseUrl);
  // Root URL path
  if (req.baseUrl === '') {
    res.status(200);
    return res.send(`
      Battlesnake documentation can be found at
       <a href="https://docs.battlesnake.io">https://docs.battlesnake.io</a>.
    `);
  }

  // Short-circuit favicon requests
  if (req.baseUrl === '/favicon.ico') {
    res.set({ 'Content-Type': 'image/x-icon' });
    res.status(200);
    res.end();
    return next();
  }

  // Reroute all 404 routes to the 404 handler
  const err: any = new Error();
  err.status = 404;
  return next(err);
});

app.use((err: any, _: any, res: any, next: any) => {
  if (err.status !== 404) {
    return next(err);
  }

  res.status(404);
  return res.send({
    status: 404,
    error: err.message || "These are not the snakes you're looking for",
  });
});

app.use((err: any, _, res: any) => {
  const statusCode = err.status || 500;

  res.status(statusCode);
  return res.send({
    status: statusCode,
    error: err,
  });
});

export const start = () =>
  app.listen(app.get('port'), () => {
    console.log('Server listening on port %s', app.get('port'));
  });
