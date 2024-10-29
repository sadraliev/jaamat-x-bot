import './config/environment.config';
import { webhookCallback } from 'grammy';
import { fastify } from 'fastify';
import { bot } from './bot';
import { envSchema } from './config/environment.config';

const server = fastify();

server.post(`/${bot.token}`, webhookCallback(bot, 'fastify'));

server.listen({ port: Number(process.env.PORT) });
