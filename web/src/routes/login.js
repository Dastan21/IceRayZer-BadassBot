import Router from '@koa/router'
import passport from 'koa-passport'

const router = new Router()

router.get('/login', async ctx => {
  await ctx.render('login', { alert: ctx.session.alert })
  ctx.session.alert = null
})

router.post('/login', async ctx => {
  return passport.authenticate('local', async (err, user) => {
    if (err) throw err

    if (user === false) {
      ctx.session.alert = { success: false, message: 'Identifiant ou mot de passe incorrect.' }
      ctx.redirect('/login')
    } else {
      await ctx.login(user)
      ctx.redirect('/')
    }
  })(ctx)
})

export default router
