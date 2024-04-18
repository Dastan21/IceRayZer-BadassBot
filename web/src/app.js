import { bodyParser } from '@koa/bodyparser'
import render from '@koa/ejs'
import Koa from 'koa'
import serve from 'koa-static'
import path from 'node:path'
import routes from './routes/index.js'

// API
const app = new Koa()
app.use(bodyParser())
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

// Websocket
const PORT = Number(process.env.PORT ?? 3000)
const HOST = process.env.HOST ?? '127.0.0.1'
app.listen(PORT, HOST, () => console.log(`Listening at http://localhost:${PORT}`))
