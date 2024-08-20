import { mkdir, readFile, readdir, unlink, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { getFeatureData, setFeatureData } from '../features.js'
import { getAudioFileName } from './common.js'

const ONJOIN_AUDIOS_PATH = path.join(import.meta.dirname, '../../../../bot/audios/onjoin')
const AUDIO_MAX_SIZE = 1000000

export async function saveConfig (req) {
  const config = await loadConfig(getFeatureData('onjoin'))

  const audiosToDelete = config.onjoin_audios.filter(a => req.body.audios !== a.userId && !(Array.isArray(req.body.audios) && req.body.audios.includes(a.userId))).map(a => path.join(ONJOIN_AUDIOS_PATH, `${a.userId}.mp3`))
  await Promise.allSettled(audiosToDelete.map(unlink))

  const newAudio = req.files?.[0]
  if (req.body.user_id !== '' || newAudio != null) {
    if (req.body.user_id === '') throw new Error('user_id est requis')
    if (isNaN(req.body.user_id) || String(req.body.user_id).length !== 18) throw new Error('user_id n\'est pas un ID valide')
    if (newAudio == null) throw new Error('audio est requis')
    if (config.onjoin_audios[req.body.user_id] != null) throw new Error('ID déjà utilisé')
    const audioName = getAudioFileName(newAudio.originalname)
    if (!audioName) throw new Error('nom de fichier audio invalide')
    if (newAudio.size > AUDIO_MAX_SIZE) throw new Error('fichier audio trop lourd')
    await saveAudio(req.body.user_id, newAudio.buffer)
  }

  const data = {
    onjoin_audios: Object.keys(req.body).filter(k => k.startsWith('volume-')).reduce((t, a) => {
      t[a.replace('volume-', '')] = Number(req.body[a]) / 100
      return t
    }, {})
  }

  await setFeatureData('onjoin', data)
}

export async function loadConfig (data) {
  const audios = await readdir(ONJOIN_AUDIOS_PATH).catch(() => [])
  return {
    onjoin_audios: await Promise.all(audios.map(async a => {
      const userId = a.replace('.mp3', '')
      return {
        userId,
        href: Buffer.from(await loadAudio(userId)).toString('base64'),
        volume: (data.onjoin_audios?.[userId] ?? 1) * 100
      }
    }))
  }
}

async function loadAudio (userId) {
  return readFile(path.join(ONJOIN_AUDIOS_PATH, `${userId}.mp3`))
}

async function saveAudio (userId, data) {
  await mkdir(path.join(ONJOIN_AUDIOS_PATH), { recursive: true })
  return writeFile(path.join(ONJOIN_AUDIOS_PATH, `${userId}.mp3`), data)
}
