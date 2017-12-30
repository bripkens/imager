#!/bin/sh

set -eo pipefail

export INDEXER_ELASTICSEARCH_HOST="127.0.0.1:9200"
export INDEXER_IMAGE_DIR="/Users/ben/backup/fotos"
export IMAGER_GEONAMES_ZIP_FILE="/Users/ben/projects/imager/indexer/zipCodes.txt"
export IMAGER_GEONAMES_COUNTRY_FILE="/Users/ben/projects/imager/indexer/countryInfo.txt"
yarn start
