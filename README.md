# linux-commit-history-search

TODO

## Get started

To run this project locally, install the dependencies and run the local server:

```sh
yarn
yarn start
```

Alternatively, you may use [Yarn](https://http://yarnpkg.com/):

```sh
yarn
yarn start
```

Open http://localhost:3000 to see your app.

## Extracting commit history

```shell
mkdir data/linux
cd data/linux
git checkout https://github.com/torvalds/linux
yarn extractCommitHistory
```

Create .env file using .env.example as sample

```shell
bundle install
yarn transformDataset
yarn index
```
