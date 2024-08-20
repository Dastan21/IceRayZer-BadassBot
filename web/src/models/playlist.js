import ytdl from '@distube/ytdl-core'
import { Readable } from 'node:stream'
import voice from '../../../bot/src/utils/voice.js'

const YTDL_OPTIONS = {
  filter: 'audioonly',
  format: 'mp3',
  highWaterMark: 1 << 24,
  liveBuffer: 1 << 20,
  dlChunkSize: 1 << 12,
  quality: 'lowestaudio'
}

export default class Playlist {
  queue = []

  constructor () {
    voice.player.on('stateChange', (oldState, newState) => {
      if (oldState.status === 'playing' && newState.status === 'idle') {
        this.queue.splice(0, 1)
        this.next()
      }
    })
  }

  /**
   * 
   * @param {import('@koa/multer').File} audio 
   */
  async add (audio) {
    if (typeof audio === 'string') {
      const info = await ytdl.getBasicInfo(audio)
      this.queue.push({
        id: info.videoDetails.videoId,
        title: `${info.videoDetails.title} | ${info.videoDetails.ownerChannelName}`,
        url: info.videoDetails.video_url
      })
    } else {
      const name = audio.originalname.replace(/\.[^.]+$/, '')
      this.queue.push({
        id: name.toLowerCase().replace(/ /g, '_').replace(/'|"/g, '').trim(),
        title: name,
        buffer: Readable.from(audio.buffer)
      })
    }

    this.play()
  }

  play () {
    if (voice.playing || voice.paused || this.queue.length <= 0) return
    
    voice.play(this.readable)
  }

  next () {
    this.stop()
    this.resume()
    this.play()
  }

  pause () {
    if (!voice.playing) return

    voice.player.pause()
  }

  resume () {
    if (voice.playing) return

    voice.player.unpause()
  }

  stop () {
    voice.player.stop()
  }

  remove (id) {
    const index = this.queue.findIndex(a => a.id === id)
    if (index < 0) return

    if (index === 0) {
      this.next()
    } else {
      this.queue.splice(index, 1)
    }
  }

  get readable() {
    const audio = this.queue[0]
    if (audio.url != null) return ytdl(audio.id, YTDL_OPTIONS)
    return audio.buffer
  }
}