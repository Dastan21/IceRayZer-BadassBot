import path from 'node:path'
import Feature from '../../utils/feature.js'
import voice from '../../utils/voice.js'

const AUDIO_PATH = path.join(import.meta.dirname, '../../../audios/sofiminigame.mp3')

export default class SofiMinigame extends Feature {
  constructor () {
    super()

    this.processSofiMinigame = this.processSofiMiniGame.bind(this)
  }

  load (client) {
    client.addListener('messageCreate', this.processSofiMiniGame)
  }

  unload (client) {
    client.removeListener('messageCreate', this.processSofiMiniGame)
  }

  async processSofiMiniGame (msg) {
    if (msg.channelId !== process.env.SOFI_CHANNEL || msg.author?.id !== process.env.SOFI_ID) return
    if (voice.channelId == null || msg.embeds.length !== 1) return
    const embed = msg.embeds[0]
    if (embed.title !== 'SOFI: MINIGAME' && embed.title !== 'Captcha Card' && !embed.description?.startsWith('When the timer runs out')) return

    voice.play(AUDIO_PATH)
  }
}
