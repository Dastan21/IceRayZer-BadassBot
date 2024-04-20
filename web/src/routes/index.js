import Router from '@koa/router'
import featuresRouter from './features.js'
import loginRouter from './login.js'

const mainRouter = new Router()

mainRouter.use(loginRouter.routes(), loginRouter.allowedMethods())
mainRouter.use(featuresRouter.routes(), featuresRouter.allowedMethods())

mainRouter.get('/', async ctx => {
  ctx.redirect('/features')
})

export default mainRouter
