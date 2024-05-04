import path from 'node:path'
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
    if (voice.channelId !== newState.channelId) return

    setTimeout(() => {
      voice.play(path.join(ON_JOIN_AUDIOS_PATH, `${newState.member.user.id}.mp3`), this.data.sofi_audios[userId])
    }, AUDIO_DELAY)
  }
}