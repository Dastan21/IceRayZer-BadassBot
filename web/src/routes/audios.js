import multer from '@koa/multer'
import Router from '@koa/router'
import { addFilePlaylist, addYoutubePlaylist, getPlaylistData, pausePlaylist, removePlaylist, resumePlaylist } from '../controllers/audios.js'

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
  await addFilePlaylist(ctx.files?.[0]).then(() => {
    ctx.session.alert = { success: true, message: 'Son ajouté à la playlist !' }
  }).catch((err) => {
    ctx.session.alert = { success: false, message: err.message ?? err }
    console.error(err)
  })
  
  ctx.redirect('/audios')
})

router.post('/youtube', async ctx => {
  await addYoutubePlaylist(ctx.request.body.yt).then(() => {
    ctx.session.alert = { success: true, message: 'Son Youtube ajouté à la playlist !' }
  }).catch((err) => {
    ctx.session.alert = { success: false, message: err.message ?? err }
    console.error(err)
  })
  
  ctx.redirect('/audios')
})

router.post('/playlist/pause', async ctx => {
  await pausePlaylist().then(() => {
    ctx.session.alert = { success: true, message: 'Playlist mise en pause !' }
  }).catch((err) => {
    ctx.session.alert = { success: false, message: err.message ?? err }
    console.error(err)
  })
  
  ctx.redirect('/audios')
})

router.post('/playlist/resume', async ctx => {
  await resumePlaylist().then(() => {
    ctx.session.alert = { success: true, message: 'Playlist en cours de lecture !' }
  }).catch((err) => {
    ctx.session.alert = { success: false, message: err.message ?? err }
    console.error(err)
  })
  
  ctx.redirect('/audios')
})

router.post('/playlist/:id/remove', async ctx => {
  await removePlaylist(ctx.params.id).then(() => {
    ctx.session.alert = { success: true, message: 'Son retiré de la playlist !' }
  }).catch((err) => {
    ctx.session.alert = { success: false, message: err.message ?? err }
    console.error(err)
  })
  
  ctx.redirect('/audios')
})

router.get('/', async ctx => {
  const playlist = await getPlaylistData()
  await ctx.render('audios', { playlist, alert: ctx.session.alert })
  ctx.session.alert = null
})

export default router
