import { mkdir, readFile, readdir, rm, stat, unlink, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { SOFI_KEYS } from '../../../../bot/src/features/sofi/sofi.js'
import { getFeatureData, setFeatureData } from '../features.js'
import { getAudioFileName } from './common.js'

const SOFI_AUDIOS_PATH = path.join(import.meta.dirname, '../../../../bot/audios/sofi')
const AUDIO_MAX_SIZE = 1000000

export async function saveConfig (req) {
  const config = await loadConfig(getFeatureData('sofi'))

  const newUserAudios = req.files.filter(f => SOFI_KEYS.includes(f.fieldname))
  if (req.body.user_id !== '' || newUserAudios.length > 0) {
    if (req.body.user_id === '') throw new Error('user_id est requis')
    if (isNaN(req.body.user_id) || String(req.body.user_id).length !== 18) throw new Error('user_id n\'est pas un ID valide')
    if (newUserAudios.length < 1) throw new Error('au moins un audio est requis')
    for (const file of newUserAudios) {
      if (config.sofi_audios[req.body.user_id] != null) throw new Error('ID déjà utilisé')
      const otherFreqName = getAudioFileName(file.originalname)
      if (!otherFreqName) throw new Error('nom de fichier audio invalide')
      if (file.size > AUDIO_MAX_SIZE) throw new Error('fichier audio trop lourd')
      await saveAudio(req.body.user_id, file.fieldname + '_' + otherFreqName, file.buffer)
    }
  }

  const addedAudios = req.files.filter(f => !SOFI_KEYS.includes(f.fieldname) && new RegExp('\\d{18}\\/' + SOFI_KEYS.join('|')).test(f.fieldname))
  for (const file of addedAudios) {
    const audioName = getAudioFileName(file.originalname)
    if (!audioName) throw new Error('nom de fichier audio invalide')
    const match = file.fieldname.match(/(\d{18})\/(\D+)/)
    const userId = match[1]
    const sofiKey = match[2]
    await saveAudio(userId, sofiKey + '_' + audioName, file.buffer)
  }

  const audiosToDelete = []
  const usersToDelete = new Set()
  Object.keys(config.sofi_audios).forEach(userId => {
    if (Object.keys(req.body).every(k => !k.startsWith(userId)) && addedAudios.find(f => f.fieldname.startsWith(userId)) == null) {
      usersToDelete.add(path.join(SOFI_AUDIOS_PATH, userId))
    }
    return Object.keys(config.sofi_audios[userId]).forEach(sofiKey => {
      return config.sofi_audios[userId][sofiKey].forEach(configAudio => {
        const audioName = req.body[`${userId}/${sofiKey}`]
        if (audioName === configAudio.name || (Array.isArray(audioName) && audioName.includes(configAudio.name))) return
        audiosToDelete.push(path.join(SOFI_AUDIOS_PATH, userId, `${configAudio.name}.mp3`))
      })
    })
  })
  await Promise.allSettled(audiosToDelete.map(unlink))
  await Promise.allSettled([...usersToDelete].map((u) => rm(u, { recursive: true, force: true })))

  const data = {
    sofi_audios: Object.keys(req.body).filter(k => k.startsWith('volume-')).reduce((t, a) => {
      t[a.replace('volume-', '')] = Number(req.body[a])
      return t
    }, {})
  }

  await setFeatureData('sofi', data)
}

export async function loadConfig (data) {
  const config = {
    sofi_audios: {},
    sofi_keys: SOFI_KEYS
  }

  if (data.sofi_audios == null) data.sofi_audios = {}

  const userIds = await readdir(SOFI_AUDIOS_PATH)
  for (const userId of userIds) {
    config.sofi_audios[userId] = {}
    for (const sofiKey of SOFI_KEYS) {
      const userAudios = await readdir(path.join(SOFI_AUDIOS_PATH, userId)).catch(() => [])
      config.sofi_audios[userId][sofiKey] = await Promise.all(userAudios.filter(a => a.startsWith(sofiKey)).map(async a => {
        const name = a.replace('.mp3', '')
        return {
          name,
          href: Buffer.from(await loadAudio(userId, name)).toString('base64'),
          volume: data.sofi_audios[`${userId}/${sofiKey}/${name}`] ?? 100
        }
      }))
    }
  }

  return config
}

async function loadAudio (userId, name) {
  return readFile(path.join(SOFI_AUDIOS_PATH, userId, `${name}.mp3`))
}

async function saveAudio (userId, name, data) {
  await mkdir(path.join(SOFI_AUDIOS_PATH, userId), { recursive: true })
  const audioPath = path.join(SOFI_AUDIOS_PATH, userId, `${name}.mp3`)
  const audioStat = await stat(audioPath).catch(() => {})
  if (audioStat != null) throw new Error('nom de fichier audio déjà utilisé')
  return writeFile(audioPath, data)
}
