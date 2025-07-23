// src/telegram/pmgBot.js
import { Bot, InlineKeyboard } from 'grammy';
import dotenv from 'dotenv';
import { getPmgAxios } from '../pmg/pmgClient.js';

dotenv.config();

const bot = new Bot(process.env.TELEGRAM_BOT_TOKEN);

// 🧠 Track last bot message per chat for clean interface
const lastMessages = new Map(); // chatId → messageId

// 🔁 Main Menu keyboard
function getMainMenu() {
    return new InlineKeyboard()
        .text('📊 PMG Status', 'status')
        .row()
        .text('📥 View Quarantine', 'quarantine');
}

// ✅ Clean reply handler: deletes previous bot message
async function sendCleanReply(ctx, text, options = {}) {
    const chatId = ctx.chat.id;

    // Try deleting last message
    const lastMsgId = lastMessages.get(chatId);
    if (lastMsgId) {
        try {
            await ctx.api.deleteMessage(chatId, lastMsgId);
        } catch (err) {
            // Silent fail (maybe already deleted)
        }
    }

    // Send new message and store its ID
    const sent = await ctx.reply(text, options);
    lastMessages.set(chatId, sent.message_id);
}

// ✅ /start command
bot.command('start', async (ctx) => {
    const message =
        '👋 Welcome to PMG Bot!\n\n' +
        'Available commands:\n' +
        '• /status — Check PMG status\n' +
        '• /quarantine — View recent spam quarantines\n\n' +
        'Or use the buttons below ⬇️';

    await sendCleanReply(ctx, message, {
        reply_markup: getMainMenu(),
    });
});

// ✅ /status command
bot.command('status', async (ctx) => {
    try {
        const pmg = await getPmgAxios();
        const res = await pmg.get('/nodes/pmg/status');
        await sendCleanReply(ctx, `✅ PMG Status: ${res.data.status || 'running'}`, {
            reply_markup: getMainMenu(),
        });
    } catch (err) {
        console.error(err);
        await sendCleanReply(ctx, `❌ Error fetching PMG status: ${err.message}`, {
            reply_markup: getMainMenu(),
        });
    }
});

// ✅ /quarantine command
bot.command('quarantine', async (ctx) => {
    await handleQuarantine(ctx);
});

// 🔘 Button: PMG Status
bot.callbackQuery('status', async (ctx) => {
    try {
        const pmg = await getPmgAxios();
        const res = await pmg.get('/nodes/pmg/status');
        await ctx.answerCallbackQuery();
        await sendCleanReply(ctx, `✅ PMG Status: ${res.data.status || 'running'}`, {
            reply_markup: getMainMenu(),
        });
    } catch (err) {
        console.error(err);
        await ctx.answerCallbackQuery();
        await sendCleanReply(ctx, `❌ Error fetching PMG status: ${err.message}`, {
            reply_markup: getMainMenu(),
        });
    }
});

// 🔘 Button: Quarantine
bot.callbackQuery('quarantine', async (ctx) => {
    await ctx.answerCallbackQuery();
    await handleQuarantine(ctx);
});

// 🔁 Reusable quarantine handler
async function handleQuarantine(ctx) {
    try {
        const pmg = await getPmgAxios();
        const res = await pmg.get('/quarantine/spam');
        const mails = res.data.data.slice(0, 5);

        if (!mails.length) {
            return await sendCleanReply(ctx, '📭 No quarantined emails found.', {
                reply_markup: getMainMenu(),
            });
        }

        // Clear last message before sending multiple quarantine entries
        const lastMsgId = lastMessages.get(ctx.chat.id);
        if (lastMsgId) {
            try {
                await ctx.api.deleteMessage(ctx.chat.id, lastMsgId);
            } catch (err) {}
            lastMessages.delete(ctx.chat.id);
        }

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

        // Show main menu after all
        const menuMsg = await ctx.reply('⬇️ Main Menu:', {
            reply_markup: getMainMenu(),
        });
        lastMessages.set(ctx.chat.id, menuMsg.message_id);
    } catch (err) {
        console.error(err);
        await sendCleanReply(ctx, `❌ Failed to fetch quarantine: ${err.message}`, {
            reply_markup: getMainMenu(),
        });
    }
}

// 🔘 Deliver email
bot.callbackQuery(/deliver:(.+)/, async (ctx) => {
    const id = ctx.match[1];
    try {
        const pmg = await getPmgAxios();
        await pmg.post('/quarantine/content', { id, action: 'deliver' });

        await ctx.answerCallbackQuery({ text: '📤 Mail delivered!' });
        await ctx.editMessageText(`✅ Delivered mail ID: ${id}`);

        const sent = await ctx.reply('⬇️ Main Menu:', {
            reply_markup: getMainMenu(),
        });
        lastMessages.set(ctx.chat.id, sent.message_id);
    } catch (err) {
        console.error(err);
        await ctx.answerCallbackQuery({ text: '❌ Delivery failed' });
    }
});

// 🔘 Delete email
bot.callbackQuery(/delete:(.+)/, async (ctx) => {
    const id = ctx.match[1];
    try {
        const pmg = await getPmgAxios();
        await pmg.post('/quarantine/content', { id, action: 'delete' });

        await ctx.answerCallbackQuery({ text: '🗑️ Mail deleted!' });
        await ctx.editMessageText(`❌ Deleted mail ID: ${id}`);

        const sent = await ctx.reply('⬇️ Main Menu:', {
            reply_markup: getMainMenu(),
        });
        lastMessages.set(ctx.chat.id, sent.message_id);
    } catch (err) {
        console.error(err);
        await ctx.answerCallbackQuery({ text: '❌ Deletion failed' });
    }
});

// 🔔 External notifier
export async function notifyAdmin(message, id = null) {
    const adminId = process.env.TELEGRAM_ADMIN_ID;
    if (!adminId) return console.error('❌ TELEGRAM_ADMIN_ID not set');

    try {
        const options = { parse_mode: 'Markdown' };
        if (id) {
            options.reply_markup = new InlineKeyboard()
                .text('✅ Deliver', `deliver:${id}`)
                .text('🗑️ Delete', `delete:${id}`);
        }
        const sent = await bot.api.sendMessage(adminId, message, options);
        lastMessages.set(adminId, sent.message_id);
    } catch (err) {
        console.error('❌ Failed to notify admin:', err.message);
    }
}

export default bot;
