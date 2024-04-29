import passport from 'koa-passport'
import { Strategy } from 'passport-local'

const user = {
  username: process.env.AUTH_NAME,
  password: process.env.AUTH_PASS
}

passport.serializeUser((_user, done) => {
  done(null, 1)
})

passport.deserializeUser(async (_id, done) => {
  try {
    done(null, user)
  } catch (err) {
    done(err)
  }
})

passport.use(new Strategy((username, password, done) => {
  if (username === user.username && password === user.password) {
    done(null, user)
  } else {
    done(null, false)
  }
}))
