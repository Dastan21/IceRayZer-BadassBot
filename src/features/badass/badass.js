import { EndBehaviorType } from '@discordjs/voice'
import { beforeLeave, startSpeak } from '../../events.js'
import db from '../../utils/db.js'
import voice from '../../utils/voice.js'

const ERROR_MARGIN = 40
const AUDIO_DURATION = 5000
const AUDIO_LEAVE_DURATION = 6000
const BOOM_PERCENT = 25
const SHINY_PERCENT = 5

let ready = true

function addSpeaker (userId) {
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
    if (speaker.margin >= ERROR_MARGIN) playBadass()
    speaker.margin = 0
  })
}

function playBadass () {
  if (!ready) return
  if (Array.from(voice.speakers.values()).map(s => s.value).some((s) => !!s)) return

  db.read()
  let rand = Math.random() * 100
  if (rand > db.data.badass_percent) return

  let audio = process.env.AUDIO
  rand = Math.random() * 100
  if (rand < SHINY_PERCENT) audio = process.env.AUDIO_SHINY ?? audio
  else if (rand < BOOM_PERCENT) audio = process.env.AUDIO_BOOM ?? audio
  voice.play(audio)
  ready = false
  setTimeout(() => { ready = true }, AUDIO_DURATION)
}

async function onBeforeLeave () {
  return await new Promise((resolve) => {
    voice.play(process.env.AUDIO_LEAVE)
    setTimeout(resolve, AUDIO_LEAVE_DURATION)
  })
}

export default () => {
  beforeLeave.push(onBeforeLeave)
  startSpeak.push(addSpeaker)
}
