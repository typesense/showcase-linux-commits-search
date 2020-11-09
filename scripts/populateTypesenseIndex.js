/* eslint-disable */

// Start Typesense server with `npm run typesenseServer`
// Then run `yarn run populateTypesenseIndex` or `node populateTypesenseIndex.js`

const Typesense = require('typesense');
const gitlog = require("gitlog").default;
const INDEX_NAME = 'linux_commit_history';
const REPO_PATH = 'data/linux';


module.exports = (async () => {
  const typesense = new Typesense.Client({
    nodes: [
      {
        host: 'localhost',
        port: '8108',
        protocol: 'http',
      },
    ],
    apiKey: 'xyz',
  });

  const schema = {
    name: INDEX_NAME,
    fields: [
      { name: 'hash', type: 'string' },
      { name: 'author_name', type: 'string', facet: true },
      { name: 'author_email', type: 'string' },
      { name: 'commit_timestamp', type: 'int32', facet: true },
      { name: 'commit_message', type: 'string' },
    ],
    default_sorting_field: 'commit_timestamp',
  };

  console.log('Populating index in Typesense');

  try {
    console.log(`Deleting existing collection: ${INDEX_NAME}`);
    await typesense.collections(INDEX_NAME).delete();
  } catch (error) {
    // Do nothing
  }

  console.log('Creating schema: ');
  console.log(JSON.stringify(schema, null, 2));
  await typesense.collections().create(schema);

  console.log('Adding records: ');

  const commits = await gitToJs(REPO_PATH);
  const results = commits.forEach(async (fullCommit) => {
    try {
      commit = {
        hash: fullCommit['hash'],
        author_name: fullCommit['authorName'],
        author_email: fullCommit['authorEmail'],
        commit_timestamp: Math.round(new Date(fullCommit['date']).getTime() / 1000),
        commit_message: fullCommit['message'],
      };

      const returnData = await typesense
        .collections(INDEX_NAME)
        .documents().create(commit);

      console.log(returnData);
      return returnData;
    } catch (error) {
      console.error(error);
      return Promise.reject(error);
    }
  });
  console.log(results);
})();
