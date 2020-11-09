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

Make output a JSONL file:

```
# Remove commas at the end of each line
gsed -i 's/,$//g' gitlogg.json

# Remove first and last lines (which contain [ and ])
gsed -i '1d; $d' gitlogg.json

# Remove extra spaces
gsed -i 's/^ *//g' gitlogg.json
```
