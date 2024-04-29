import { Readable } from 'node:stream'
import voice from '../../../bot/src/utils/voice.js'
import YTPlayer from '../models/ytplayer.js'

const ytplayer = new YTPlayer()

export async function playAudioFile (file) {
  if (file == null) throw new Error('Audio requis')
  
  voice.play(Readable.from(file.buffer))
}

export async function getYTData () {
  return {
    audios: ytplayer.queue,
    playing: voice.playing
  }
}

export async function playAudioYoutube (url) {
  if (url == null) throw new Error('URL non renseignée')

  await ytplayer.add(url)
}

export async function pauseAudioYoutube () {
  ytplayer.pause()
}

export async function resumeAudioYoutube () {
  ytplayer.resume()
}


export async function removeAudioYoutube (id) {
  ytplayer.remove(id)
}

