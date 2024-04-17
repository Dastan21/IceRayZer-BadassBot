import { randomInt } from 'node:crypto'
import { readdir } from 'node:fs/promises'
import voice from '../../utils/voice.js'

const SOFI_AUDIOS_PATH = './audios/sofi'
const SOFI_KEYS = ['drop', 'grab']

async function processSofi (msg) {
  if (msg.channelId !== '1205893733569138799' || msg.author?.id !== '742070928111960155') return
  // if (msg.channelId !== '1205893733569138799') return // DEBUG
  if (msg.mentions.users.size !== 1) return

  const userId = msg.mentions.users.first().id
  if (!voice.speakers.has(userId)) return

  const key = getSofiKey(msg.content)
  if (key == null) return

  const files = await readdir(`${SOFI_AUDIOS_PATH}/${userId}`).catch(() => {}) ?? []
  const audios = files.filter(a => a.startsWith(key))
  const audio = audios.length > 1 ? audios[randomInt(0, audios.length)] : audios[0]
  if (audio == null) return

  voice.play(`${SOFI_AUDIOS_PATH}/${userId}/${audio}`, 1)
}

function getSofiKey (content) {
  for (const key of SOFI_KEYS) {
    if (content.toLowerCase().includes(key)) return key
  }
  return null
}

export default (client) => {
  client.on('messageCreate', (msg) => {
    processSofi(msg)
  })
}
