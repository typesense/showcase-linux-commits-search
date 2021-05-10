# Linux Commit History Search

This is a demo that showcases some of Typesense's features using 1 Million commit messages from the Linux kernel [repo](https://github.com/torvalds/linux).

View it live here: https://linux-commits-search.typesense.org/

# Tech Stack

This search experience is powered by Typesense which is a fast, open source typo-tolerant search-engine. It is an open source alternative to Algolia and an easier-to-use alternative to ElasticSearch.

The dataset was extracted by running `git log` on the Linux Kernel git repo.

The dataset is ~950MB on disk, with ~1 million records. It took 45 minutes to index this dataset on a 3-node Typesense cluster with 4vCPUs per node and the index was ~3GB in RAM.

The app was built using the [Typesense Adapter for InstantSearch.js](https://github.com/typesense/typesense-instantsearch-adapter) and is hosted on S3, with CloudFront for a CDN.

The search backend is powered by a geo-distributed 3-node Typesense cluster running on [Typesense Cloud](https://cloud.typesense.org), with nodes in Oregon, Frankfurt and Mumbai.


## Repo structure

- `src/` and `index.html` - contain the frontend UI components, built with <a href="https://github.com/typesense/typesense-instantsearch-adapter" target="_blank">Typesense Adapter for InstantSearch.js</a>
- `scripts/` - contains the scripts to extract, transform and index the git log data into Typesense.

## Development

1. Create a `.env` file using `.env.example` as reference.

2. Extract commit history

  ```shell
  mkdir data/linux
  cd data/linux
  git checkout https://github.com/torvalds/linux
  yarn extractCommitHistory:merges > data/git-log-output
  yarn extractCommitHistory:nonMerges >> data/git-log-output
  ```

3. Transform and index the data
  ```shell
  bundle install
  yarn transformDataset
  yarn run typesenseServer
  yarn index
  ```

4. Install dependencies and run the local server:

```shell
yarn
yarn start
```

Open http://localhost:3000 to see the app.

## Deployment

The app is hosted on S3, with Cloudfront for a CDN.

```shell
yarn build
yarn deploy
```
