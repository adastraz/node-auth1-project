const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const session = require('express-session')
const restricted = require('./auth/restricted-middleware.js')
const KnexStore = require('connect-session-knex')(session)

const authRouter = require('./auth/auth-router.js');
const usersRouter = require('./users/user-router');
const knex = require('./database/dbConfig')

const server = express();

const sessionConfig = {
  name: 'test',
  secret: 'keep it secret, keep it safe!',
  resave: false,
  saveUninitialized: true,
  cookie: {
    maxAge: 1000 * 60 * 10,
    secure: false, //should always be true in production
    httpOnly: true // almost always true, can't touch cookie with js
  },
  store: new KnexStore({
    knex,
    tablename: 'sessions',
    createtable: true,
    sidfieldname: 'sid',
    clearInterval: 1000 * 60 * 15,
  })
}

server.use(helmet());
server.use(express.json());
server.use(cors());
server.use(session(sessionConfig))

server.use('/api/auth', authRouter);
server.use('/api/users', restricted, usersRouter);

server.get('/', (req, res) => {
  res.json({ api: 'up' });
});

module.exports = server;