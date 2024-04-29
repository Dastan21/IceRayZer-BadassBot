import Router from '@koa/router'
import audiosRouter from './audios.js'
import featuresRouter from './features.js'
import loginRouter from './login.js'

const mainRouter = new Router()

mainRouter.use(loginRouter.routes(), loginRouter.allowedMethods())
mainRouter.use(featuresRouter.routes(), featuresRouter.allowedMethods())
mainRouter.use(audiosRouter.routes(), audiosRouter.allowedMethods())

mainRouter.get('/', async ctx => {
  ctx.redirect('/features')
})

export default mainRouter
