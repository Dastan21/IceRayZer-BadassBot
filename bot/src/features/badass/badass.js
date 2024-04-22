import { EndBehaviorType } from '@discordjs/voice'
import path from 'node:path'
import Feature from '../../utils/feature.js'
import voice from '../../utils/voice.js'

const ERROR_MARGIN = 40

const AUDIOS_PATH = path.join(import.meta.dirname, '../../../audios')
const AUDIO_BADASS = 'badass'
const AUDIO_DURATION = 5000

export default class Badass extends Feature {
  ready = true

  constructor () {
    super({
      badass_freq: 0.1,
      others_freq: []
    })
  }

  startSpeak (userId) {
    let speaker = voice.speakers.get(userId)
    if (speaker == null) {
      speaker = {
        stream: null,
        value: true,
        margin: 0,
        userId
      }
      voice.speakers.set(userId, speaker)
    }

    speaker.stream?.destroy()
    speaker.stream = voice.connection.receiver.subscribe(userId, {
      end: {
        behavior: EndBehaviorType.AfterSilence,
        duration: 1000
      }
    })

    speaker.stream.on('data', (_data) => {
      if (speaker == null) return

      speaker.value = true
      speaker.margin++
    })

    speaker.stream.on('close', () => {
      if (speaker == null) return

      speaker.value = false
      if (speaker.margin >= ERROR_MARGIN) this.playBadass()
      speaker.margin = 0
    })
  }

  playBadass () {
    if (!this.ready) return
    if (Array.from(voice.speakers.values()).map(s => s.value).some((s) => !!s)) return

    let rand = Math.random()
    if (rand > this.data.badass_freq) return

    let audio = AUDIO_BADASS
    // Pick audio file randomly (by freq)
    rand = Math.random()
    const audioFreqs = this.data.others_freq.sort((a, b) => a.freq - b.freq)
    for (const af of audioFreqs) {
      if (rand < af.freq) {
        audio = af.name
        break
      }
    }

    voice.play(this.getAudioPath(audio), this.data.others_freq[audio]?.volume)
    this.ready = false
    setTimeout(() => { this.ready = true }, AUDIO_DURATION)
  }

  getAudioPath (audio) {
    return path.join(AUDIOS_PATH, `${audio}.mp3`)
  }
}
