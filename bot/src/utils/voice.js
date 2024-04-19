import { VoiceConnectionStatus, createAudioPlayer, createAudioResource, entersState } from '@discordjs/voice'
import { features } from './feature.js'

const VOICE_CONNECTION_TIMEOUT = 1000

class Voice {
  channelId = null
  player = createAudioPlayer()
  speakers = new Map()
  playing = false
  connection = null

  constructor () {
    this.player.on('error', console.error)
  }

  async connect (connection) {
    this.connection = connection
    this.connection.subscribe(this.player)
    await entersState(this.connection, VoiceConnectionStatus.Ready, VOICE_CONNECTION_TIMEOUT)

    this.connection.receiver.speaking.on('start', (userId) => {
      Object.values(features).forEach(f => f.startSpeak(userId))
    })
  }

  disconnect () {
    this.connection?.destroy()
    this.connection = null
  }

  play (audio, volume = 0.1) {
    const resource = createAudioResource(audio ?? '', { inlineVolume: true })
    resource.volume?.setVolume(volume)
    this.player.play(resource)
  }
}

export default new Voice()
