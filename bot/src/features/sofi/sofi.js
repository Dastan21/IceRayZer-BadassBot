import { randomInt } from 'node:crypto'
import { readdir } from 'node:fs/promises'
import path from 'node:path'
import { client } from '../../bot.js'
import Feature from '../../utils/feature.js'
import voice from '../../utils/voice.js'

const SOFI_AUDIOS_PATH = path.join(import.meta.dirname, '../../../audios/sofi')
export const SOFI_KEYS = ['drop', 'grab']

export default class Sofi extends Feature {
  constructor () {
    super({
      sofi_audios: {}
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
    if (msg.channelId !== process.env.SOFI_CHANNEL || msg.author?.id !== process.env.SOFI_ID) return
    if (msg.mentions.users.size !== 1) return
    if (voice.channelId == null) return

    const userId = msg.mentions.users.first().id
    const channel = await client.channels.fetch(voice.channelId)
    if (channel.members.find(m => m.user.id === userId) == null) return

    const sofiKey = this.getSofiKey(msg.content)
    if (sofiKey == null) return

    const files = await readdir(path.join(SOFI_AUDIOS_PATH, userId)).catch(() => {}) ?? []
    const audios = files.filter(a => a.startsWith(sofiKey))
    const audio = audios.length > 1 ? audios[randomInt(0, audios.length)] : audios[0]
    if (audio == null) return

    voice.play(path.join(SOFI_AUDIOS_PATH, userId, audio), this.data.sofi_audios[`${userId}/${sofiKey}/${audio}`] / 2)
  }

  getSofiKey (content) {
    for (const key of SOFI_KEYS) {
      if (content.toLowerCase().includes(key)) return key
    }
    return null
  }
}
