import { getVoiceConnection } from '@discordjs/voice'
import { Client, GatewayIntentBits } from 'discord.js'
import { readdir, stat } from 'node:fs/promises'
import path from 'node:path'
import { interactionHandlers } from './interactions.js'
import db from './utils/db.js'
import voice from './utils/voice.js'

const FEATURES_PATH = './features'

const client = new Client({
  intents: [
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.Guilds,
    GatewayIntentBits.MessageContent
  ]
})

client.on('ready', () => {
  console.info(`${client.user?.tag} connecté !`)
  client.user?.setPresence({ status: 'invisible' })

  initFeatures()
})

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isCommand() || !interaction.guildId) return

  const handler = interactionHandlers.get(interaction.commandName)
  try {
    if (handler) {
      await handler(interaction, getVoiceConnection(interaction.guildId))
    } else {
      await interaction.reply('Commande inconnue.')
    }
  } catch (err) {
    console.error(err)
  }
})

client.on('voiceStateUpdate', (_oldState, newState) => {
  if (voice == null) return
  if (voice.channel !== newState.channelId) voice.speakers.delete(newState.member.user.id)
  if (newState.channel?.members.filter((m) => !m.user.bot).size > 0) return

  voice.connection = getVoiceConnection(newState.guild.id)
  voice.leave()
})

client.login(process.env.TOKEN)

async function initFeatures () {
  const featSrcDirPath = path.join('src', FEATURES_PATH)
  const dirs = await readdir(featSrcDirPath)
  db.read()
  for (const featDir of dirs) {
    if (db.data.features[featDir]?.disabled === false) continue

    const featPath = `${FEATURES_PATH}/${featDir}/${featDir}.js`
    const featStat = await stat(path.join('src', featPath)).catch(() => {})
    if (featStat == null || !featStat.isFile()) continue

    import(featPath).then((module) => {
      module.default(client)
    }).catch((err) => {
      console.warn(`Failed to load: ${featStat}:`, err)
    })
  }
}
