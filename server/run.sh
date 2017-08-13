#!/bin/sh

set -eo pipefail

export SERVER_ELASTICSEARCH_HOST="127.0.0.1:9200"
yarn start
