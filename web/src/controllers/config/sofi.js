import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

const SOFI_AUDIOS_PATH = path.join(import.meta.dirname, '../../../../bot/audios/sofi')
const AUDIO_MAX_SIZE = 1000000

export async function saveConfig (req) {
  // TODO
}

export async function loadConfig (data) {
  // TODO
  return {}
}

async function loadAudio (name) {
  return readFile(path.join(SOFI_AUDIOS_PATH, `${name}.mp3`))
}

async function saveAudio (name, data) {
  return writeFile(path.join(SOFI_AUDIOS_PATH, `${name}.mp3`), data)
}
