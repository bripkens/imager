const {buildSchema} = require('graphql');
const path = require('path');
const fs = require('fs');

module.exports = buildSchema(fs.readFileSync(path.join(__dirname, 'schema.graphql'), {encoding: 'utf8'}));
