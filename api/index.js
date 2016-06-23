import apiServer from 'saturn-framework/api';

import passport from 'passport';
import { apolloServer } from 'apollo-server';
import { Strategy as GitHubStrategy } from 'passport-github';

import { schema, resolvers } from './schema';
import { GitHubConnector } from './github/connector';
import { Repositories, Users } from './github/models';
import { Entries } from './sql/models';

import knex from './sql/connector';
import session from 'express-session';
const KnexSessionStore = require('connect-session-knex')(session);
const store = new KnexSessionStore({
  knex,
});

const {
  GITHUB_CLIENT_ID,
  GITHUB_CLIENT_SECRET,
} = process.env;

apiServer.use(session({
  // XXX: secret
  secret: 'your secret',
  resave: true,
  saveUninitialized: true,
  store,
}));

apiServer.use(passport.initialize());
apiServer.use(passport.session());

apiServer.get('/login/github',
  passport.authenticate('github'));

apiServer.get('/login/github/callback',
  passport.authenticate('github', { failureRedirect: '/' }),
  (req, res) => {
    res.redirect('/');
  });

apiServer.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/');
});

apiServer.use('/graphql', apolloServer((req) => {
  // Get the query, the same way express-graphql does it
  // https://github.com/graphql/express-graphql/blob/3fa6e68582d6d933d37fa9e841da5d2aa39261cd/src/index.js#L257
  const query = req.query.query || req.body.query;
  if (query && query.length > 2000) {
    // None of our app's queries are this long
    // Probably indicates someone trying to send an overly expensive query
    throw new Error('Query too large.');
  }

  let user;
  if (req.user) {
    // We get req.user from passport-github with some pretty oddly named fields,
    // let's convert that to the fields in our schema, which match the GitHub
    // API field names.
    user = {
      login: req.user.username,
      html_url: req.user.profileUrl,
      avatar_url: req.user.photos[0].value,
    };
  }

  const gitHubConnector = new GitHubConnector({
    client_id: GITHUB_CLIENT_ID,
    client_secret: GITHUB_CLIENT_SECRET,
  });

  return {
    graphiql: true,
    pretty: true,
    resolvers,
    schema,
    context: {
      user,
      Repositories: new Repositories({ connector: gitHubConnector }),
      Users: new Users({ connector: gitHubConnector }),
      Entries: new Entries(),
    },
  };
}));

apiServer.start();

const gitHubStrategyOptions = {
  clientID: GITHUB_CLIENT_ID,
  clientSecret: GITHUB_CLIENT_SECRET,
  // XXX: magic string
  callbackURL: 'http://localhost:3000/login/github/callback',
};

passport.use(new GitHubStrategy(gitHubStrategyOptions, (accessToken, refreshToken, profile, cb) => {
  cb(null, profile);
}));

passport.serializeUser((user, cb) => {
  cb(null, user);
});

passport.deserializeUser((obj, cb) => {
  cb(null, obj);
});
