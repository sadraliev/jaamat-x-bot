import { Bot } from 'grammy';

const token = process.env.TELEGRAM_BOT_TOKEN;
if (!token) throw new Error('TELEGRAM_BOT_TOKEN is unset');

const bot = new Bot(token);

bot.command('start', (ctx) => ctx.reply('Welcome! Up and running.'));
bot.on('message:text', (ctx) => ctx.reply(ctx.msg.text));

export { bot };
