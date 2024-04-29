import multer from '@koa/multer'
import Router from '@koa/router'
import { Readable } from 'node:stream'
import voice from '../../../bot/src/utils/voice.js'

const upload = multer({
  storage: multer.memoryStorage()
})

const router = new Router({
  prefix: '/audios'
})

router.use((ctx, next) => {
  if (ctx.isAuthenticated()) {
    return next()
  } else {
    ctx.redirect('/login')
  }
})

router.post('/play', upload.any(), async ctx => {
  const file = ctx.files[0]
  if (file == null) throw new Error('Audio requis')
  voice.play(Readable.from(file.buffer))
  ctx.redirect('/audios')
})

router.get('/', async ctx => {
  await ctx.render('audios', { alert: ctx.session.alert })
  ctx.session.alert = null
})

export default router
