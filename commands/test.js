import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  MessageFlags,
} from 'discord.js';

export default {
  name: 'test',
  description: 'Показать меню с кнопкой и выбором',

  // ---------- Текстовая команда +menu ----------
  async text(message) {
    const button = new ButtonBuilder()
      .setCustomId('demo_button')
      .setLabel('Нажми меня')
      .setEmoji('<a:xa_wolf_nervous:1431392425724739715>')
      .setStyle(ButtonStyle.Primary);

   /* const select = new StringSelectMenuBuilder()
      .setCustomId('demo_select')
      .setPlaceholder('Выбери цвет...')
      .addOptions(
        new StringSelectMenuOptionBuilder()
          .setLabel('Красный')
          .setValue('red')
          .setEmoji('🔴'),
        new StringSelectMenuOptionBuilder()
          .setLabel('Синий')
          .setValue('blue')
          .setEmoji('🔵'),
        new StringSelectMenuOptionBuilder()
          .setLabel('Зелёный')
          .setValue('green')
          .setEmoji('🟢'),
      );*/

    await message.reply({
      content: 'Выбери действие:',
      components: [
        new ActionRowBuilder().addComponents(button),
       // new ActionRowBuilder().addComponents(select),
      ],
    });
  },

  // ---------- Кнопки ----------
  async button(interaction) {
    if (interaction.customId !== 'demo_button') return;

    await interaction.update({
      content: 'Ты нажал кнопку! 🎉',
      flags: MessageFlags.Ephemeral,
    });
  },

  // ---------- Выпадающее меню ----------
  /*async select(interaction) {
    if (interaction.customId !== 'demo_select') return;

    const color = interaction.values[0]; // 'red' | 'blue' | 'green'
    const names = { red: 'Красный', blue: 'Синий', green: 'Зелёный' };

    await interaction.reply({
      content: `Ты выбрал: **${names[color]}**`,
      flags: MessageFlags.Ephemeral,
    });
  },*/
};