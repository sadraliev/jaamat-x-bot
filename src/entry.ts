import { webhookCallback } from 'grammy';
import { bot } from './bot';
//@ts-ignore
export default async ({ req, res, log, error }) => {
  console.log('webhook is running');
  webhookCallback(bot, 'std/http')(req);
};
