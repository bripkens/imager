#!/bin/sh

set -eo pipefail

curl -X DELETE localhost:9200/imager

export INDEXER_ELASTICSEARCH_HOST="127.0.0.1:9200"
export INDEXER_IMAGE_DIR="/Users/ben/backup/fotos/2017-06-los-angeles/"
export INSTANA_GEONAMES_CITY_FILE="/Users/ben/projects/imager/indexer/cities1000.txt"
export INSTANA_GEONAMES_COUNTRY_FILE="/Users/ben/projects/imager/indexer/countryInfo.txt"
yarn start
