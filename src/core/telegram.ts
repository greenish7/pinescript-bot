import { Telegraf } from 'telegraf';
import { config } from '../config';

const bot = new Telegraf(config.BOT_TOKEN);

export const sendMessage = async (message: string) => {
  try {
    for (const chatId of config.WHITELISTED_IDS) {
      await bot.telegram.sendMessage(chatId, normalizeMessage(message), {
        parse_mode: 'MarkdownV2',
        disable_web_page_preview: true,
      });
    }
  } catch (error) {
    message = JSON.parse(JSON.stringify(error)).response?.description || error;
    console.error(message);
  }
};

const normalizeMessage = (message: string) => {
  return message
    .replaceAll('_', '\\_')
    .replaceAll('|', '\\|')
    .replaceAll('.', '\\.')
    .replaceAll('{', '\\{')
    .replaceAll('}', '\\}')
    .replaceAll('=', '\\=')
    .replaceAll('+', '\\+')
    .replaceAll('>', '\\>')
    .replaceAll('<', '\\<')
    .replaceAll('-', '\\-')
    .replaceAll('!', '\\!');
};
