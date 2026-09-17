import petPetGif from '@someaspy/pet-pet-gif'; // ← или путь к твоему модулю "./index.js"
import { AttachmentBuilder, MessageFlags } from 'discord.js';

export default {
  name: 'petpet',
  description: 'Глажу аватарку участника',

  async text(message, args) {
    // 1. Определяем, кого гладим
    const target = await resolveTargetUser(message, args);

    if (!target) {
      return message.reply('Чот пошло не так <:crying:1541940716782096474>');
    }

    // 2. Показываем «печатает», чтобы бот не выглядел зависшим
    await message.channel.sendTyping();

    // 3. Берём аватар в PNG
    const avatarURL = target.displayAvatarURL({ extension: 'png', size: 256 });

    // 4. Генерируем GIF
    let gif;
    try {
      gif = await petPetGif(avatarURL);
    } catch (err) {
      console.error(err);
      return message.reply('Не удалось сгенерировать GIF <:crying:1541940716782096474>');
    }

    // 5. Отправляем как вложение (без сохранения на диск!)
    const attachment = new AttachmentBuilder(gif, { name: 'petpet.gif' });

    await message.reply({
      content: `<:shoked:1541941066415210617> ${message.author.displayName} гладит ${target.displayName}`,
      files: [attachment],
    });
  },
};

async function resolveTargetUser(message, args) {
  const mentioned = message.mentions.users.first();
  if (mentioned) return mentioned;

  if (args[0]) {
    try {
      return await message.client.users.fetch(args[0]);
    } catch {
      return null;
    }
  }

  return message.author;
}