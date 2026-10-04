import { inspect } from 'node:util';
import { PermissionsBitField } from 'discord.js';

export default {
  name: 'eval',
  description: 'Выполнить JS-код (только для администраторов)',

  async text(message, args) {
    // 1. Проверка прав: только администраторы сервера
    if (!message.member?.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return message.reply('ой, не получилось <:crying:1541940716782096474>');
    }

    // 2. Собираем код из аргументов
    const code = args.join(' ');
    if (!code) {
      return message.reply('Пусто. Напиши код после команды.');
    }

    // 3. Фильтр опасных вызовов
    const forbidden = [
      /\bprocess\s*\.\s*exit\b/,        // process.exit(...)
      /\bclient\s*\.\s*destroy\b/,      // client.destroy()
      /\bmessage\s*\.\s*client\s*\.\s*destroy\b/,
      /\bprocess\s*\.\s*kill\b/,        // process.kill(...)
      /\bprocess\s*\.\s*abort\b/,
      /\brequire\s*\(\s*['"]child_process['"]\s*\)/,
    ];

    const hit = forbidden.find(re => re.test(code));
    if (hit) {
      return message.reply('Запрещённая конструкция в коде.');
    }

    // 4. Показываем «печатает»
    await message.channel.sendTyping();

    let result;
    try {
      result = await eval(`(async () => { return ${code}; })()`);
    } catch (err) {
      result = err;
    }

    // 5. Красиво форматируем результат
    let output = typeof result === 'string'
      ? result
      : inspect(result, { depth: 1 });

    // 6. Обрезаем, чтобы не превысить лимит Discord
    if (output.length > 1900) {
      output = output.slice(0, 1900) + '\n... (обрезано)';
    }

    const box = '```js\n' + output + '\n```';

    try {
      await message.reply(box);
    } catch {
      await message.reply({ content: output.slice(0, 1990) });
    }
  },
};
