const _ = require('lodash');

const repos = [
  {
    repository_name: 'apollostack/apollo-client',
    posted_by: 'stubailo',
  },
  {
    repository_name: 'apollostack/apollo-server',
    posted_by: 'helfer',
  },
  {
    repository_name: 'meteor/meteor',
    posted_by: 'tmeasday',
  },
  {
    repository_name: 'Poincare/QLearn',
    posted_by: 'Poincare',
  },
  {
    repository_name: 'dancannon/gorethink',
    posted_by: 'stubailo',
  },
  {
    repository_name: 'xlvector/hector',
    posted_by: 'tmeasday',
  },
  {
    repository_name: 'eclipse/omr',
    posted_by: 'stubailo',
  },
  {
    repository_name: 'eclipse/smarthome',
    posted_by: 'tmeasday',
  },
  {
    repository_name: 'pydata/pandas',
    posted_by: 'Poincare',
  },
  {
    repository_name: 'dutchcoders/transfer.sh',
    posted_by: 'stubailo',
  },
  {
    repository_name: 'dutchcoders/goftp',
    posted_by: 'Poincare',
  },
  {
    repository_name: 'gabrielecirulli/2048',
    posted_by: 'stubailo',
  },
  {
    repository_name: 'Hextris/hextris',
    posted_by: 'helfer',
  },
  {
    repository_name: 'Q42/0hh1',
    posted_by: 'Poincare',
  },
  {
    repository_name: 'facebook/reason',
    posted_by: 'tmeasday',
  },
  {
    repository_name: 'facebook/react',
    posted_by: 'Poincare',
  },
];

const repoIds = {};

const usenames = [
  'stubailo',
  'helfer',
];

const votes = {};

export function seed(knex, Promise) {
  //set up the repos with no votes
  repos.forEach((repo) => {
    votes[repo.repository_name] = {}
  });

  return Promise.all([
    knex('entries').del(),
    knex('votes').del(),
  ])

  // Insert some entries for the repositories
  .then(() => {
    return Promise.all(repos.map(({ repository_name, posted_by }, i) => {
      return knex('entries').insert({
        created_at: Date.now() - i * 10000,
        updated_at: Date.now() - i * 10000,
        repository_name,
        posted_by,
      }).then(([id]) => {
        repoIds[repository_name] = id;
      });
    }))
  })

  // Insert some votes so that we can render a sorted feed
  .then(() => {
    return Promise.all(_.toPairs(votes).map(([repoName, voteMap]) => {
      return Promise.all(_.toPairs(voteMap).map(([username, vote_value]) => {
        return knex('votes').insert({
          entry_id: repoIds[repoName],
          vote_value,
          username,
        });
      }));
    }));
  })
};
