import multer from '@koa/multer'
import Router from '@koa/router'
import { playAudioYoutube as addAudioYoutube, getYTData, pauseAudioYoutube, playAudioFile, removeAudioYoutube, resumeAudioYoutube } from '../controllers/audios.js'

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

router.post('/file', upload.any(), async ctx => {
  await playAudioFile(ctx.files?.[0]).then(() => {
    ctx.session.alert = { success: true, message: 'Son joué !' }
  }).catch((err) => {
    ctx.session.alert = { success: false, message: err.message ?? err }
    console.error(err)
  })
  
  ctx.redirect('/audios')
})

router.post('/youtube/add', async ctx => {
  await addAudioYoutube(ctx.request.body.yt).then(() => {
    ctx.session.alert = { success: true, message: 'Son Youtube mis en pause !' }
  }).catch((err) => {
    ctx.session.alert = { success: false, message: err.message ?? err }
    console.error(err)
  })
  
  ctx.redirect('/audios')
})

router.post('/youtube/pause', async ctx => {
  await pauseAudioYoutube().then(() => {
    ctx.session.alert = { success: true, message: 'Son Youtube mis en pause !' }
  }).catch((err) => {
    ctx.session.alert = { success: false, message: err.message ?? err }
    console.error(err)
  })
  
  ctx.redirect('/audios')
})

router.post('/youtube/resume', async ctx => {
  await resumeAudioYoutube().then(() => {
    ctx.session.alert = { success: true, message: 'Son Youtube en cours de lecture !' }
  }).catch((err) => {
    ctx.session.alert = { success: false, message: err.message ?? err }
    console.error(err)
  })
  
  ctx.redirect('/audios')
})

router.post('/youtube/:id/remove', async ctx => {
  await removeAudioYoutube(ctx.params.id).then(() => {
    ctx.session.alert = { success: true, message: 'Son Youtube retiré !' }
  }).catch((err) => {
    ctx.session.alert = { success: false, message: err.message ?? err }
    console.error(err)
  })
  
  ctx.redirect('/audios')
})

router.get('/', async ctx => {
  const data = await getYTData()
  await ctx.render('audios', { data, alert: ctx.session.alert })
  ctx.session.alert = null
})

export default router
