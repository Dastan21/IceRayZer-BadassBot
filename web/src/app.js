import { bodyParser } from '@koa/bodyparser'
import render from '@koa/ejs'
import Koa from 'koa'
import passport from 'koa-passport'
import session from 'koa-session'
import serve from 'koa-static'
import path from 'node:path'
import './auth.js'
import routes from './routes/index.js'

// API
const app = new Koa()
app.keys = [process.env.SESSION_SECRET]
app.use(bodyParser())
app.use(session({
  maxAge: 1000 * 60 * 60 * 24 * 7 // a week
}, app))
app.use(passport.initialize())
app.use(passport.session())
app.use(serve(path.join(import.meta.dirname, '..', 'public')))
render(app, {
  root: path.join(import.meta.dirname, 'views'),
  layout: 'layout',
  viewExt: 'ejs'
})

app.use(async (ctx, next) => {
  try {
    await next()
  } catch (err) {
    ctx.status = 400
    ctx.err = err
    ctx.body = `errorHandler: ${err.message}`
  }
})

app.use(routes.routes(), routes.allowedMethods())

app.use(async ctx => {
  ctx.redirect('/')
})

// Websocket
const PORT = Number(process.env.PORT ?? 3000)
const HOST = process.env.HOST ?? '127.0.0.1'
app.listen(PORT, HOST, () => console.log(`Listening at http://localhost:${PORT}`))
