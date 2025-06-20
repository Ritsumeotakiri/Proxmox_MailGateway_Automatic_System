// src/telegram/pmgBot.js
import { Bot, InlineKeyboard } from 'grammy';
import dotenv from 'dotenv';
import { getPmgAxios } from '../pmg/pmgClient.js';

dotenv.config();

const bot = new Bot(process.env.TELEGRAM_BOT_TOKEN);

// /start command
bot.command('start', (ctx) => {
    ctx.reply(
        '👋 Welcome to PMG Bot!\n\n' +
        'Available commands:\n' +
        '• /status — Check PMG status\n' +
        '• /quarantine — View recent spam quarantines'
    );
});

// /status command
bot.command('status', async (ctx) => {
    try {
        const pmg = await getPmgAxios();
        const res = await pmg.get('/nodes/pmg/status');
        ctx.reply(`✅ PMG Status: ${res.data.status || 'running'}`);
    } catch (err) {
        console.error(err);
        ctx.reply(`❌ Error fetching PMG status: ${err.message}`);
    }
});

// /quarantine command with Deliver/Delete buttons
bot.command('quarantine', async (ctx) => {
    try {
        const pmg = await getPmgAxios();
        const res = await pmg.get('/quarantine/spam');
        const mails = res.data.data.slice(0, 5);

        if (!mails.length) return ctx.reply('📭 No quarantined emails found.');

        for (const mail of mails) {
            const text = `📧 *From:* ${mail.sender}\n📨 *Subject:* ${mail.subject || '(No subject)'}\n🆔 *ID:* ${mail.id}`;
            const keyboard = new InlineKeyboard()
                .text('✅ Deliver', `deliver:${mail.id}`)
                .text('🗑️ Delete', `delete:${mail.id}`);

            await ctx.reply(text, {
                parse_mode: 'Markdown',
                reply_markup: keyboard,
            });
        }
    } catch (err) {
        console.error(err);
        ctx.reply(`❌ Failed to fetch quarantine: ${err.message}`);
    }
});

// Callback for Deliver action
bot.callbackQuery(/deliver:(.+)/, async (ctx) => {
    const id = ctx.match[1];
    try {
        const pmg = await getPmgAxios();
        await pmg.post(`/quarantine/content`, { id, action: 'deliver' });

        await ctx.answerCallbackQuery({ text: '📤 Mail delivered!' });
        await ctx.editMessageText(`✅ Delivered mail ID: ${id}`);
    } catch (err) {
        console.error(err);
        await ctx.answerCallbackQuery({ text: '❌ Delivery failed' });
    }
});

// Callback for Delete action
bot.callbackQuery(/delete:(.+)/, async (ctx) => {
    const id = ctx.match[1];
    try {
        const pmg = await getPmgAxios();
        await pmg.post(`/quarantine/content`, { id, action: 'delete' });

        await ctx.answerCallbackQuery({ text: '🗑️ Mail deleted!' });
        await ctx.editMessageText(`❌ Deleted mail ID: ${id}`);
    } catch (err) {
        console.error(err);
        await ctx.answerCallbackQuery({ text: '❌ Deletion failed' });
    }
});

export async function notifyAdmin(message, id = null) {
    const adminId = process.env.TELEGRAM_ADMIN_ID;
    if (!adminId) return console.error('❌ TELEGRAM_ADMIN_ID not set');

    try {
        const options = {
            parse_mode: 'Markdown',
        };

        // If spam ID is provided, attach buttons
        if (id) {
            options.reply_markup = new InlineKeyboard()
                .text('✅ Deliver', `deliver:${id}`)
                .text('🗑️ Delete', `delete:${id}`);
        }

        await bot.api.sendMessage(adminId, message, options);
    } catch (err) {
        console.error('❌ Failed to notify admin:', err.message);
    }
}


export default bot;
