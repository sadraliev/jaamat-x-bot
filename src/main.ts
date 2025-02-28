import { webhookCallback } from 'grammy';
import { fastify } from 'fastify';
import { bot } from './bot';
import './config/environment.config';

const server = fastify();

server.post(`/${bot.token}`, webhookCallback(bot, 'fastify'));

server.listen(
  { port: Number(process.env.PORT) || 3000, host: '0.0.0.0' },
  function (err, address) {
    if (err) {
      server.log.error(err);
      process.exit(1);
    }
    server.log.info(`server listening on ${address}`);
  }
);
