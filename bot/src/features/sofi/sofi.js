import { randomInt } from 'node:crypto'
import { readdir } from 'node:fs/promises'
import path from 'node:path'
import Feature from '../../utils/feature.js'
import voice from '../../utils/voice.js'

const SOFI_AUDIOS_PATH = path.join(import.meta.dirname, '../../../audios/sofi')

export default class Sofi extends Feature {
  constructor () {
    super({
      sofi_keys: ['drop', 'grab']
    })

    this.processSofi = this.processSofi.bind(this)
  }

  load (client) {
    client.addListener('messageCreate', this.processSofi)
  }

  unload (client) {
    client.removeListener('messageCreate', this.processSofi)
  }

  async processSofi (msg) {
    if (msg.channelId !== '1205893733569138799' || msg.author?.id !== '742070928111960155') return
    if (msg.mentions.users.size !== 1) return

    const userId = msg.mentions.users.first().id
    if (!voice.speakers.has(userId)) return

    const key = this.getSofiKey(msg.content)
    if (key == null) return

    const files = await readdir(path.join(SOFI_AUDIOS_PATH, userId)).catch(() => {}) ?? []
    const audios = files.filter(a => a.startsWith(key))
    const audio = audios.length > 1 ? audios[randomInt(0, audios.length)] : audios[0]
    if (audio == null) return

    voice.play(path.join(SOFI_AUDIOS_PATH, userId, audio), 1)
  }

  getSofiKey (content) {
    for (const key of this.data.sofi_keys) {
      if (content.toLowerCase().includes(key)) return key
    }
    return null
  }
}
