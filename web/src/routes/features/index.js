import Router from '@koa/router'
import { getFeature, getFeatures, toggleFeature } from '../../controllers/features.js'

const router = new Router({
  prefix: '/features'
})

router.get('/:feat', async ctx => {
  const meta = await getFeature(ctx.params.feat)
  if (meta == null) {
    ctx.status = 404
    await ctx.render('not-found')
  } else {
    ctx.status = 200
    ctx.body = meta
  }
})

router.post('/:feat/toggle', async ctx => {
  await toggleFeature(ctx.params.feat, ctx.request.body.toggle).catch((err) => {
    ctx.state.error = err
  })
  ctx.redirect('/features')
})

router.get('/', async ctx => {
  const features = await getFeatures()
  await ctx.render('features', {
    features,
    error: ctx.state.error
  })
})

export default router
