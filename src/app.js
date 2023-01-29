import jQuery from 'jquery';

window.$ = jQuery; // workaround for https://github.com/parcel-bundler/parcel/issues/333

import 'popper.js';
import 'bootstrap';
import instantsearch from 'instantsearch.js/es';
import {
  searchBox,
  infiniteHits,
  configure,
  stats,
  refinementList,
  menu,
  sortBy,
  currentRefinements,
  rangeInput,
  toggleRefinement,
} from 'instantsearch.js/es/widgets';
import { instantMeiliSearch } from '@meilisearch/instant-meilisearch'
import 'regenerator-runtime/runtime'

const HOST = process.env.MEILISEARCH_HOST;
const API_KEY = process.env.MEILISEARCH_API_KEY;
const INDEX_NAME = process.env.MEILISEARCH_INDEX_NAME;

const search = instantsearch({
  indexName: INDEX_NAME,
  searchClient: instantMeiliSearch(
    HOST,
    API_KEY
  ),
})

search.addWidgets([
  searchBox({
    container: '#searchbox',
    showSubmit: false,
    showReset: false,
    placeholder: 'Type in a search term... ',
    autofocus: true,
    cssClasses: {
      input: 'form-control',
      loadingIcon: 'stroke-primary',
    },
    queryHook(query, search) {
      search(query);
    },
  }),
  // stats({
  //   container: '#stats',
  //   templates: {
  //     text: ({ nbHits, hasNoResults, hasOneResult, processingTimeMS }) => {
  //       let statsText = '';
  //       if (hasNoResults) {
  //         statsText = 'no commits';
  //       } else if (hasOneResult) {
  //         statsText = '1 commit';
  //       } else {
  //         statsText = `${nbHits.toLocaleString()} commits`;
  //       }
  //       return `Found ${statsText} ${
  //         indexSize ? ` from ${indexSize.toLocaleString()}` : ''
  //       } in ${processingTimeMS}ms.`;
  //     },
  //   },
  //   cssClasses: {
  //     text: 'text-muted',
  //   },
  // }),
  infiniteHits({
    container: '#hits',
    cssClasses: {
      list: 'list-unstyled',
      item: 'd-flex flex-column search-result-card p-4 border border-dark mb-3',
      loadMore: 'btn btn-primary mx-auto d-block mt-4',
      disabledLoadMore: 'btn btn-dark mx-auto d-block mt-4',
    },
    templates: {
      item: (data) => {
        return `
            <div class="row">
              <div class="col-11">
                <h6 class="text-primary" style="overflow-wrap: break-word;">
                  ${data._highlightResult.subject.value}
                </h6>
              </div>
              <div class="col-1 text-right my-2 my-md-0">
                <a role="button"
                onclick="window.tweetSearchTerm(); event.preventDefault();"
                data-commit-message="${data.subject}"
                data-commit-sha="${data.sha}"
                class="text-decoration-none text-white"
                >Tweet</a>
              </div>
            </div>
            <div class="text-muted small">
              Authored by ${data.author_name} • Committed by ${data.committer_name}
            </div>
            <div class="text-muted small mt-1" style="overflow-wrap: break-word;">
              ${data.id} • <a href="https://github.com/torvalds/linux/commit/${data.id}" target="_blank">View Diff</a>
            </div>
            <div class="text-muted small mt-1">
              ${data.num_files_changed} file(s) changed,
              ${data.num_insertions} insertion(s),
              ${data.num_deletions} deletion(s)
            </div>
            <div class="text-muted small mt-1">
              ${data.author_date}
            </div>

            <div class="mt-4" style="overflow-wrap: break-word;">
              ${data.transformedBody}
            </div>
        `;
      },
      empty:
        'No commits found for <q>{{ query }}</q>. Try another search term.',
      showMoreText: 'Show more commits',
    },
    transformItems: (items) => {
      return items.map((item) => {
        return {
          ...item,
          transformedBody: item._highlightResult.body.value
            .replace(/\n\n/g, '\n')
            .split('\n')
            .join('<br/>'),
          author_date: (() => {
            const parsedDate = new Date(item.author_timestamp * 1000);
            return parsedDate.toDateString();
          })(),
        };
      });
    },
  }),
  currentRefinements({
    container: '#current-refinements',
    cssClasses: {
      list: 'list-unstyled',
      item: 'h5 badge badge-dark mr-2 px-2',
      delete: 'btn btn-sm btn-link text-decoration-none p-0 px-2',
    },
    transformItems: (items) => {
      const labelLookup = {
        author_email_domain: 'Author',
        author_name: 'Author',
        author_timestamp_year: 'Year',
        committer_email_domain: 'Committer',
        committer_name: 'Committer',
        num_insertions: 'Insertions',
        num_deletions: 'Deletions',
        num_files_changed: 'Files',
        is_merge: 'Merge Commits',
      };
      const modifiedItems = items.map((item) => {
        return {
          ...item,
          label: labelLookup[item.attribute] || '',
        };
      });
      return modifiedItems;
    },
  }),
  menu({
    container: '#author-timestamp-year-date-selector',
    attribute: 'author_timestamp_year',
    sortBy: ['name:desc'],
    cssClasses: {
      list: 'list-unstyled',
      label: 'text-white',
      link: 'text-decoration-none',
      count: 'badge text-dark-2 ml-2',
      selectedItem: 'pl-3',
    },
  }),
  toggleRefinement({
    container: '#exclude-merge-commits-toggle-refinement',
    attribute: 'is_merge',
    on: 'false',
    templates: {
      labelText: 'Exclude',
    },
    cssClasses: {
      label: 'd-flex align-items-center',
      checkbox: 'mr-2',
    },
  }),
  refinementList({
    container: '#author-email-domain-refinement-list',
    attribute: 'author_email_domain',
    searchable: true,
    searchablePlaceholder: 'Search author email domain',
    showMore: true,
    limit: 5,
    cssClasses: {
      searchableInput:
        'form-control form-control-sm form-control-secondary mb-2 border-light-2',
      searchableSubmit: 'd-none',
      searchableReset: 'd-none',
      showMore: 'btn btn-secondary btn-sm',
      list: 'list-unstyled',
      count: 'badge text-dark-2 ml-2',
      label: 'd-flex align-items-center',
      checkbox: 'mr-2',
    },
  }),
  refinementList({
    container: '#author-name-refinement-list',
    attribute: 'author_name',
    searchable: true,
    searchablePlaceholder: 'Search author name',
    showMore: true,
    limit: 5,
    cssClasses: {
      searchableInput:
        'form-control form-control-sm form-control-secondary mb-2 border-light-2',
      searchableSubmit: 'd-none',
      searchableReset: 'd-none',
      showMore: 'btn btn-secondary btn-sm align-content-center',
      list: 'list-unstyled',
      count: 'badge text-dark-2 ml-2',
      label: 'd-flex align-items-center',
      checkbox: 'mr-2',
    },
  }),
  refinementList({
    container: '#committer-name-refinement-list',
    attribute: 'committer_name',
    searchable: true,
    searchablePlaceholder: 'Search committer name',
    showMore: true,
    limit: 5,
    cssClasses: {
      searchableInput:
        'form-control form-control-sm form-control-secondary mb-2 border-light-2',
      searchableSubmit: 'd-none',
      searchableReset: 'd-none',
      showMore: 'btn btn-secondary btn-sm',
      list: 'list-unstyled',
      count: 'badge text-dark-2 ml-2',
      label: 'd-flex align-items-center',
      checkbox: 'mr-2',
    },
  }),
  refinementList({
    container: '#committer-email-domain-refinement-list',
    attribute: 'committer_email_domain',
    searchable: true,
    searchablePlaceholder: 'Search committer email domain',
    showMore: true,
    limit: 5,
    cssClasses: {
      searchableInput:
        'form-control form-control-sm form-control-secondary mb-2 border-light-2',
      searchableSubmit: 'd-none',
      searchableReset: 'd-none',
      showMore: 'btn btn-secondary btn-sm',
      list: 'list-unstyled',
      count: 'badge text-dark-2 ml-2',
      label: 'd-flex align-items-center',
      checkbox: 'mr-2',
    },
  }),
  rangeInput({
    container: '#files-changed-range-input',
    attribute: 'num_files_changed',
    cssClasses: {
      form: 'form',
      input: 'form-control form-control-sm form-control-secondary',
      submit:
        'btn btn-sm btn-secondary ml-2 border border-secondary border-width-2',
      separator: 'text-muted mx-2',
    },
  }),
  rangeInput({
    container: '#commit-insertions-range-input',
    attribute: 'num_insertions',
    cssClasses: {
      form: 'form',
      input: 'form-control form-control-sm form-control-secondary',
      submit:
        'btn btn-sm btn-secondary ml-2 border border-secondary border-width-2',
      separator: 'text-muted mx-2',
    },
  }),
  rangeInput({
    container: '#commit-deletions-range-input',
    attribute: 'num_deletions',
    cssClasses: {
      form: 'form',
      input: 'form-control form-control-sm form-control-secondary',
      submit:
        'btn btn-sm btn-secondary ml-2 border border-secondary border-width-2',
      separator: 'text-muted mx-2',
    },
  }),
  configure({
    hitsPerPage: 5,
  }),
  sortBy({
    container: '#sort-by',
    items: [
      { label: 'Recent first', value: `${INDEX_NAME}` },
      {
        label: 'Oldest first',
        value: `${INDEX_NAME}/sort/author_timestamp_year:asc`,
      },
    ],
    cssClasses: {
      select: 'custom-select custom-select-sm',
    },
  }),
]);

function handleSearchTermClick(event) {
  const $searchBox = $('#searchbox input[type=search]');
  search.helper.clearRefinements();
  $searchBox.val(event.currentTarget.textContent);
  $searchBox.trigger('change');
  search.helper.setQuery($searchBox.val()).search();
}

search.start();

$(async function () {
  const $searchBox = $('#searchbox input[type=search]');
  // Set initial search term
  // if ($searchBox.val().trim() === '') {
  //   $searchBox.val('device driver');
  //   search.helper.setQuery($searchBox.val()).search();
  // }

  // Handle example search terms
  $('.clickable-search-term').on('click', handleSearchTermClick);

  // Clear refinements, when searching
  // $searchBox.on('keydown', (event) => {
  //   search.helper.clearRefinements();
  // });

  if (!matchMedia('(min-width: 768px)').matches) {
    $searchBox.on('focus keydown change input', () => {
      console.log('change');
      $('html, body').animate(
        {
          scrollTop: $('#searchbox-container').offset().top,
        },
        500
      );
    });
  }

  window.tweetSearchTerm = function () {
    const currentSearchTerm = $('#searchbox input[type=search]').val().trim();
    let text = `Found an interesting tidbit searching for "${currentSearchTerm}" in #LinuxCommitMessages via @typesense\n\n${window.location}\n\n#TuxTurns30 #30YearsOfLinux`;

    if (currentSearchTerm === '') {
      text = `Search for interesting commit messages in the Linux Kernel via @typesense\n\nhttps://linux-commits-search.typesense.org\n\n#TuxTurns30 #30YearsOfLinux #LinuxCommitMessages`;
    }

    const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      text
    )}`;

    window.location = tweetUrl;

    return false;
  };
});
