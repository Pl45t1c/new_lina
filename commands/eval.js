import { inspect } from 'node:util';
import { PermissionsBitField } from 'discord.js';

export default {
  name: 'eval',
  description: 'Выполнить JS-код (только для администраторов)',

  async text(message, args) {
    // 1. Только администраторы сервера
    if (!message.member?.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return message.reply('Не для тебя <:crying:1541940716782096474>');
    }

    // 2. Собираем код
    const code = args.join(' ');
    if (!code) {
      return message.reply('Пусто. Напиши код после команды.');
    }

    // 3. Фильтр опасных конструкций
    const forbidden = [
      /\bprocess\s*\.\s*exit\b/,
      /\bprocess\s*\.\s*kill\b/,
      /\bprocess\s*\.\s*abort\b/,
      /\bclient\s*\.\s*destroy\b/,
      /\bmessage\s*\.\s*client\s*\.\s*destroy\b/,
      /\brequire\s*\(\s*['"]child_process['"]\s*\)/,
    ];

    if (forbidden.some(re => re.test(code))) {
      return message.reply('Запрещённая конструкция в коде.');
    }

    // 4. «Печатает»
    await message.channel.sendTyping();

    // 5. Авто-детект: если в коде есть return — вставляем как тело функции,
    //    иначе оборачиваем как выражение (return подставляем сами).
    const hasReturn = /\breturn\b/.test(code);
    const wrapped = hasReturn
      ? `(async () => { ${code} })()`
      : `(async () => { return ${code}; })()`;

    let result;
    let isError = false;
    try {
      result = await eval(wrapped);
    } catch (err) {
      result = err;
      isError = true;
    }

    // 6. Форматируем вывод
    let output;
    if (typeof result === 'string') {
      output = result;
    } else {
      output = inspect(result, { depth: 1 });
    }

    // 7. Обрезаем под лимит Discord
    const maxLen = 1900;
    if (output.length > maxLen) {
      output = output.slice(0, maxLen) + '\n... (обрезано)';
    }

    // 8. Оборачиваем в блок кода
    const box = '```js\n' + output + '\n```';

    try {
      await message.reply(box);
    } catch {
      // если в выводе есть ``` — ломает разметку, шлём без бокса
      await message.reply({ content: output.slice(0, 1990) });
    }
  },
};
