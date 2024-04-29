import { getVoiceConnection } from '@discordjs/voice'
import { Client, GatewayIntentBits } from 'discord.js'
import { interactionHandlers } from './interactions.js'
import { loadFeatures } from './utils/feature.js'
import voice from './utils/voice.js'

export const client = new Client({
  intents: [
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.Guilds,
    GatewayIntentBits.MessageContent
  ]
})

if (process.env.WEB_ONLY !== 'true') {
  client.on('ready', () => {
    console.info(`${client.user?.tag} connecté !`)
    client.user?.setPresence({ status: 'invisible' })

    loadFeatures(client)
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

  client.on('voiceStateUpdate', (olSdtate, newState) => {
    if (olSdtate.channel == null || olSdtate.member.user.id === client.user.id) return
    if (voice.channelId !== newState.channelId) voice.speakers.delete(newState.member.user.id)
    if (olSdtate.channel.members.filter((m) => !m.user.bot).size > 0) return

    voice.connection = getVoiceConnection(newState.guild.id)
    voice.disconnect()
  })

  client.login(process.env.TOKEN)
}
