import ytdl from '@distube/ytdl-core'
import voice from '../../../bot/src/utils/voice.js'

const YTDL_OPTIONS = {
  filter: 'audioonly',
  format: 'mp3',
  highWaterMark: 1 << 24,
  liveBuffer: 1 << 20,
  dlChunkSize: 1 << 12,
  quality: 'lowestaudio'
}

export default class YTPlayer {
  queue = []

  constructor () {
    voice.player.on('stateChange', (oldState, newState) => {
      if (oldState.status === 'playing' && newState.status === 'idle') {
        this.next()
      }
    })
  }

  async add (url) {
    const info = await ytdl.getBasicInfo(url)

    this.queue.push({
      id: info.videoDetails.videoId,
      title: `${info.videoDetails.title} | ${info.videoDetails.ownerChannelName}`,
      url: info.videoDetails.video_url
    })

    this.play()
  }

  play () {
    if (voice.playing || this.queue.length <= 0) return
    
    voice.play(ytdl(this.queue[0].id, YTDL_OPTIONS))
  }

  next () {
    this.queue.splice(0, 1)
    this.stop()
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
      this.stop()
    } else {
      this.queue.splice(index, 1)
    }
  }
}