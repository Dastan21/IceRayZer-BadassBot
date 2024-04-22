import { readFile, unlink, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { getFeatureData, setFeatureData } from '../features.js'
import { getAudioFileName } from './common.js'

const AUDIOS_PATH = path.join(import.meta.dirname, '../../../../bot/audios')
const AUDIO_MAX_SIZE = 1000000

export async function saveConfig (req) {
  if (isNaN(req.body.badass_freq) || req.body.badass_freq === '') throw new Error('badass_freq doit être un nombre')
  if (Number(req.body.badass_freq) <= 0 || Number(req.body['freq-']) > 1) throw new Error('badass_freq doit être compris entre 0 exclu et 1')
  const othersFreq = Object.keys(req.body).filter(k => k.startsWith('freq-') && k !== 'freq-').map(k => {
    const name = k.replace('freq-', '')
    return {
      name: getAudioFileName(name),
      freq: Number(req.body[k]),
      volume: Number(req.body[`volume-${name}`])
    }
  }).filter(Boolean)

  const file = req.files.find(f => f.fieldname === 'audio')
  if (file != null || req.body['freq-'] !== '') {
    if (file == null) throw new Error('fichier audio manquant')
    if (!file.mimetype.startsWith('audio')) throw new Error('format audio invalide')
    const otherFreqName = getAudioFileName(file.originalname)
    if (!otherFreqName) throw new Error('nom de fichier audio invalide')
    if (file.size > AUDIO_MAX_SIZE) throw new Error('fichier audio trop lourd')
    if (req.body['freq-'] === '') throw new Error('others_freq est requis')
    if (isNaN(req.body['freq-'])) throw new Error('others_freq doit être un nombre')
    if (Number(req.body['freq-']) <= 0 || Number(req.body['freq-']) > 1) throw new Error('others_freq doit être compris entre 0 exclu et 1')
    othersFreq.push({ name: otherFreqName, freq: Number(req.body['freq-']) })
    await saveAudio(otherFreqName, file.buffer)
  }

  const prevData = await getFeatureData('badass')
  await Promise.allSettled(prevData.others_freq.filter(o => !othersFreq.find(f => o.name === f.name)).map(o => unlink(path.join(AUDIOS_PATH, `${o.name}.mp3`))))

  const data = {
    badass_freq: Number(req.body.badass_freq),
    others_freq: othersFreq
  }
  await setFeatureData('badass', data)
}

export async function loadConfig (data) {
  return {
    badass_freq: data.badass_freq,
    others_freq: await Promise.all(data.others_freq.map(async o => ({
      name: o.name,
      href: Buffer.from(await loadAudio(o.name)).toString('base64'),
      freq: o.freq,
      volume: o.volume ?? 100
    })))
  }
}

async function loadAudio (name) {
  return readFile(path.join(AUDIOS_PATH, `${name}.mp3`))
}

async function saveAudio (name, data) {
  return writeFile(path.join(AUDIOS_PATH, `${name}.mp3`), data)
}
