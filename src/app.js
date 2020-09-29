/* global algoliasearch instantsearch */

const searchClient = algoliasearch('latency', '6be0576ff61c053d5f9a3225e2a90f76');

const search = instantsearch({
  indexName: 'linux_commit_history',
  searchClient,
});

search.addWidgets([
  instantsearch.widgets.searchBox({
    container: '#searchbox',
  }),
  instantsearch.widgets.hits({
    container: '#hits',
  }),
  instantsearch.widgets.pagination({
    container: '#pagination',
  }),
]);

search.start();
