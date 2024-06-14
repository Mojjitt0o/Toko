const passport = require('passport');
const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');
const { JWT_SECRET_KEY } = process.env;
const { User } = require('../models')

passport.use(new JwtStrategy({
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: "rahasia"
}, (payload, done) => {
    User.findByPk(payload.id)
    .then((user) => done(null, user))
    .catch((err) => done(err, false))
}))

module.exports = passport