#!/usr/bin/env bash
set -e

DIR=$(realpath $(dirname "$0"))

# start with an empty data directory
rm -rf "${DIR}/../dictionaries"
mkdir "${DIR}/../dictionaries"

# build a Debian Docker image with the latest Hunspell dictionaries installed
docker build --pull --tag debian-hunspell-dictionaries "${DIR}"

# copy the dictionaries data and licenses out of the Docker image
docker run --rm \
  --workdir /opt \
  --volume "${DIR}/../dictionaries":/dictionaries \
  --volume "${DIR}/languages.json":/opt/languages.json:ro \
  --volume "${DIR}/build.mjs":/opt/build.mjs:ro \
  debian-hunspell-dictionaries \
  node /opt/build.mjs

