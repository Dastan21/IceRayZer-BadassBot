import multer from '@koa/multer'
import Router from '@koa/router'
import { getFeatures, toggleFeature, updateFeatureConfig } from '../controllers/features.js'

const upload = multer({
  storage: multer.memoryStorage()
})

const router = new Router({
  prefix: '/features'
})

router.use((ctx, next) => {
  if (ctx.isAuthenticated()) {
    return next()
  } else {
    ctx.redirect('/login')
  }
})

router.post('/:feat/toggle', async ctx => {
  await toggleFeature(ctx.params.feat, ctx.request.body.toggle).then(() => {
    ctx.session.alert = { success: true, message: `Fonctionnalité ${ctx.request.body.toggle ? 'activée' : 'désactivée'} !` }
  }).catch((err) => {
    ctx.session.alert = { success: false, message: err.message ?? err }
    console.error(err)
  })
  ctx.redirect('/features')
})

router.post('/:feat/config', upload.any(), async ctx => {
  await updateFeatureConfig(ctx.params.feat, ctx.request).then(() => {
    ctx.session.alert = { success: true, message: 'Configurations sauvegardées !' }
  }).catch((err) => {
    ctx.session.alert = { success: false, message: err.message ?? err }
    console.error(err)
  })
  ctx.redirect('/features')
})

router.get('/', async ctx => {
  const features = await getFeatures()
  await ctx.render('features', { features, alert: ctx.session.alert })
  ctx.session.alert = null
})

export default router
