import Router from '@koa/router'
import featuresRouter from './features/index.js'

const mainRouter = new Router()

mainRouter.use(featuresRouter.routes(), featuresRouter.allowedMethods())

mainRouter.get('/', async ctx => {
  ctx.redirect('/features')
})

export default mainRouter
