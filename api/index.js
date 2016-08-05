import express from 'express';
import session from 'express-session';
import passport from 'passport';
import { apolloServer } from 'apollo-server';
import { Server as WS_Server, Client as WS_Client } from 'ws-graphql';
import { Strategy as GitHubStrategy } from 'passport-github';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import knex from './sql/connector';
import { makeExecutableSchema } from 'graphql-tools';
import http from 'http';

const KnexSessionStore = require('connect-session-knex')(session);
const store = new KnexSessionStore({
  knex,
});

import { schema, resolvers } from './schema'; //schema is a list
import { GitHubConnector } from './github/connector';
import { Repositories, Users } from './github/models';
import { Entries, Comments } from './sql/models';

dotenv.config({ silent: true });
let PORT = 3010;

if (process.env.PORT) {
  PORT = parseInt(process.env.PORT, 10) + 100;
}

const {
  GITHUB_CLIENT_ID,
  GITHUB_CLIENT_SECRET,
} = process.env;

const app = express();

var graphql_schema = makeExecutableSchema({
  typeDefs: schema,
  resolvers,
});

const gitHubConnector = new GitHubConnector({
  clientId: GITHUB_CLIENT_ID,
  clientSecret: GITHUB_CLIENT_SECRET,
});

app.use(session({
  secret: 'your secret',
  resave: true,
  saveUninitialized: true,
  store,
}));

app.use(passport.initialize());
app.use(passport.session());

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get('/login/github',
  passport.authenticate('github'));

app.get('/login/github/callback',
  passport.authenticate('github', { failureRedirect: '/' }),
  (req, res) => res.redirect('/'));

app.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/');
});

app.use('/graphql', apolloServer((req) => {
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
    ws_server.options.contextValue.user = user;
  }

  return {
    graphiql: true,
    pretty: true,
    schema,
    resolvers,
    context: {
      user,
      Repositories: new Repositories({ connector: gitHubConnector }),
      Users: new Users({ connector: gitHubConnector }),
      Entries: new Entries(),
      Comments: new Comments(),
      trigger: (message) => {
        ws_server.triggerAction(message);
      }
    },
  };
}));

/*app.listen(PORT, () => console.log( // eslint-disable-line no-console
  `Server is now running on http://localhost:${PORT}`
));*/

var httpServer = http.createServer(app);
httpServer.listen(PORT, function() {
  console.log("HTTP server is listening on port " + PORT);
});
//Websocket Server

const triggerGenerator = function(message_data) {
  const query = message_data.query;
  if (query.startsWith('query Comment')) {
    return [{name: 'mutation submitComment', variables: message_data.variables}];
  } 
}

var ws_server = new WS_Server({
  schema: graphql_schema,
  contextValue: {
      //user, //need to get user value from request
      Repositories: new Repositories({ connector: gitHubConnector }),
      Users: new Users({ connector: gitHubConnector }),
      Entries: new Entries(),
      Comments: new Comments(),
  },
  triggerGenerator: triggerGenerator,
}, httpServer);

const gitHubStrategyOptions = {
  clientID: GITHUB_CLIENT_ID,
  clientSecret: GITHUB_CLIENT_SECRET,
  callbackURL: 'http://localhost:3000/login/github/callback',
};

passport.use(new GitHubStrategy(gitHubStrategyOptions, (accessToken, refreshToken, profile, cb) => {
  cb(null, profile);
}));

passport.serializeUser((user, cb) => cb(null, user));
passport.deserializeUser((obj, cb) => cb(null, obj));
