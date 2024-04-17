import { joinVoiceChannel } from '@discordjs/voice'
import { GuildMember } from 'discord.js'
import { beforeLeave } from './events.js'
import * as console from './utils/logger.js'
import voice from './utils/voice.js'

async function join (interaction, connection) {
  let channel = null
  if (interaction.member instanceof GuildMember && interaction.member.voice.channel) {
    channel = interaction.member.voice.channel
    if (connection != null) {
      if (connection.joinConfig.channelId === channel.id) {
        await interaction.reply({ content: 'Badass est déjà dans le salon.', ephemeral: true })
        return
      } else {
        connection.destroy()
      }
    }
    connection = joinVoiceChannel({
      channelId: channel.id,
      guildId: channel.guild.id,
      selfDeaf: false,
      selfMute: false,
      adapterCreator: channel.guild.voiceAdapterCreator
    })
    voice.channel = channel.id
  } else {
    await interaction.reply({ content: 'Vous devez d\'abord être dans un salon vocal.', ephemeral: true })
    return
  }

  try {
    voice.connect(connection)
  } catch (err) {
    console.error(err)
    connection.destroy()
    await interaction.reply({ content: 'Impossible de rejoindre le salon vocal. Vérifier que Badass y a accès.', ephemeral: true })
  }

  await interaction.reply({ content: 'Badass a rejoint le salon vocal.', ephemeral: true })
}

async function leave (interaction, connection) {
  if (connection == null) {
    await interaction.reply({ content: 'Badass n\'est pas connecté au salon vocal.', ephemeral: true })
    return
  }

  await interaction.deferReply({ ephemeral: true })
  try {
    await Promise.allSettled(beforeLeave.map(f => f?.()))
    voice.disconnect()
    interaction.editReply('Badass est parti du salon vocal.')
  } catch (err) {
    console.error(err)
  }
}

export const interactionHandlers = new Map()
interactionHandlers.set('join', join)
interactionHandlers.set('leave', leave)
