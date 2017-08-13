const {graphqlExpress, graphiqlExpress} = require('apollo-server-express');
const logger = require('get-logger')('server:express');
const express = require('express');
const bodyParser = require('body-parser');

const config = require('./config');

exports.start = () => {
  const app = express();
  app.set('x-powered-by', false);

  app.use(require('./routes/images'));
  app.use('/graphql', bodyParser.json(), graphqlExpress({
    schema: require('./graphql/schema'),
    rootValue: require('./graphql/resolvers')
  }));
  app.use('/graphiql', graphiqlExpress({
    endpointURL: `${config.baseUrl}/graphql`
  }));

  app.listen(config.http.port, config.http.bindAddress, () => {
    logger.info(`App listening on port ${config.http.port}!`);
  });
};
