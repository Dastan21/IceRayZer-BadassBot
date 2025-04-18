import path from 'node:path'
import { client } from '../../bot.js'
import Feature from '../../utils/feature.js'
import voice from '../../utils/voice.js'

const ON_JOIN_AUDIOS_PATH = path.join(import.meta.dirname, '../../../audios/onjoin')
const AUDIO_DELAY = 500

export default class OnJoin extends Feature {
  constructor () {
    super({
      onjoin_audios: {}
    })

    this.processOnJoin = this.processOnJoin.bind(this)
  }

  load (client) {
    client.addListener('voiceStateUpdate', this.processOnJoin)
  }

  unload (client) {
    client.removeListener('voiceStateUpdate', this.processOnJoin)
  }

  async processOnJoin (_oldState, newState) {
    const userId = newState.member.user.id
    if (_oldState.channelId === voice.channelId || newState.channelId !== voice.channelId || userId === client.user.id) return

    setTimeout(() => {
      voice.play(path.join(ON_JOIN_AUDIOS_PATH, `${userId}.mp3`), this.data.onjoin_audios[userId])
    }, AUDIO_DELAY)
  }
}
