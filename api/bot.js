import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(200).send('Bot is active');
    const body = req.body;
    if (!body.message || !body.message.text) return res.status(200).send('OK');

    const chatId = body.message.chat.id;
    const text = body.message.text;
    const myId = process.env.ADMIN_CHAT_ID;

    // Перевірка адміна
    if (String(chatId) !== String(myId)) return res.status(200).send('OK');

    // --- ЛОГІКА ДЛЯ ІСТОРІЇ ---
    if (text.startsWith('/history ')) {
        // Формат: /history 2024 | Заголовок | Текст
        const rawContent = text.replace('/history ', '');
        
        // Розбиваємо текст по символу "|"
        const parts = rawContent.split('|');

        // Перевіряємо, чи є всі 3 частини
        if (parts.length < 3) {
            await sendMessage(chatId, "⚠️ Невірний формат!\nТреба так:\n/history 2025 | Назва події | Опис події");
            return res.status(200).send('OK');
        }

        const year = parts[0].trim();
        const title = parts[1].trim();
        const description = parts[2].trim();

        // Записуємо в базу
        const { error } = await supabase
            .from('history')
            .insert([{ year: parseInt(year), title: title, description: description }]);

        if (error) {
            await sendMessage(chatId, "❌ Помилка: " + error.message);
        } else {
            await sendMessage(chatId, `✅ Подію за ${year} рік додано!`);
        }
    } 
    // ... тут можуть бути інші команди (наприклад для новин) ...
    else {
        await sendMessage(chatId, "Команди:\n/history Рік | Заголовок | Текст");
    }

    return res.status(200).send('OK');
}

async function sendMessage(chatId, text) {
    await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, text: text })
    });
}