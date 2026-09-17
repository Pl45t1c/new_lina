import 'dotenv/config';
import chalk from 'chalk';
import { readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { REST, Routes } from 'discord.js';
import { Client, Events, GatewayIntentBits } from 'discord.js';

const log = {
  info:  (msg) => console.log(chalk.cyan('[INFO] '),  msg),
  ok:    (msg) => console.log(chalk.green('[OK] '),   msg),
  warn:  (msg) => console.log(chalk.yellow('[WARN] '), msg),
  error: (msg) => console.log(chalk.red('[ERR] '),   msg),
};

const PREFIX = '+';

// ---------- Слэш-команды ----------
const commands = [
  { name: 'ping', description: 'Replies with Pong!' },
];

const rest = new REST({ version: '10' }).setToken(process.env.MEME_TOKEN);

try {
  log.info('Запущено обновление слэш команд.');
  await rest.put(Routes.applicationCommands(process.env.MEME_APP_ID), { body: commands });
  log.ok('Успешное обновление слэш команд.');
} catch (error) {
  console.error(error);
}

// ---------- Клиент ----------
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,   // ← чтобы получать сообщения
    GatewayIntentBits.MessageContent,  // ← чтобы видеть текст
  ],
});

client.on(Events.ClientReady, readyClient => {
  log.ok(`Бот успешно авторизован как ${readyClient.user.tag}`);
});

// ---------- Слэш-команды ----------
client.on(Events.InteractionCreate, async (interaction) => {
  // Слэш-команды
  if (interaction.isChatInputCommand()) {
    if (interaction.commandName === 'ping') {
      return interaction.reply('Pong!');
    }
    return;
  }

  // Кнопки
  if (interaction.isButton()) {
    for (const cmd of Object.values(textCommands)) {
      if (typeof cmd.button === 'function') {
        await cmd.button(interaction);
      }
    }
    return;
  }

  // Выпадающие меню
  if (interaction.isStringSelectMenu()) {
    for (const cmd of Object.values(textCommands)) {
      if (typeof cmd.select === 'function') {
        await cmd.select(interaction);
      }
    }
    return;
  }
});

// ---------- Текстовые команды ----------
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const textCommands = {};

const commandsPath = path.join(__dirname, 'commands');
const commandFiles = readdirSync(commandsPath).filter((f) => f.endsWith('.js'));

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = (await import(`file://${filePath}`)).default;

  const hasHandler =
  typeof command?.run === 'function' ||
  typeof command?.text === 'function';

  if (!command?.name || !hasHandler) {
    log.warn(`Файл ${file} пропущен: нет name или обработчика`);
    continue;
  }

  textCommands[command.name] = command;
  log.info(`Загружена текстовая команда: ${command.name}`);
}

client.on(Events.MessageCreate, async (message) => {
  if (message.author.bot) return;        // не реагируем на ботов и себя
  if (!message.content.startsWith(PREFIX)) return;

  // Парсим: "!hello world foo" → name="hello", args=["world","foo"]
  const [rawName, ...args] = message.content.slice(PREFIX.length).trim().split(/\s+/);
  const name = rawName.toLowerCase();

  const command = textCommands[name];
  if (!command) return;                  // неизвестная команда — молчим

  try {
  if (typeof command.text === 'function') {
    await command.text(message, args);
  } else {
    await command.run(message, args);
  }
  } catch (err) {
    log.error(`Ошибка в команде "${name}": ${err}`);
    await message.reply('Что-то пошло не так 😢');
  }
});

client.login(process.env.MEME_TOKEN);