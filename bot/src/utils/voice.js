import { AudioPlayerStatus, NoSubscriberBehavior, VoiceConnectionStatus, createAudioPlayer, createAudioResource, entersState } from '@discordjs/voice'
import { features } from './feature.js'

const VOICE_CONNECTION_TIMEOUT = 1000

class Voice {
  channelId = null
  player = createAudioPlayer()
  speakers = new Map()
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

  play (audio, volume = 0.2) {
    if (audio == null) return

    const resource = createAudioResource(audio ?? '', { inlineVolume: true })
    resource.volume?.setVolume(Math.min(volume, 1) / 2)
    this.player.play(resource, { behaviors: { noSubscriber: NoSubscriberBehavior.Play } })
  }

  get playing () {
    return this.player.state.status === AudioPlayerStatus.Playing
  }

  get paused () {
    return this.player.state.status === AudioPlayerStatus.Paused
  }
}

export default new Voice()
