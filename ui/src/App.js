import React from 'react';

import { InMemoryCache } from 'apollo-cache-inmemory';
import { RadiumStarterRoot } from 'radium-starter';
import { ApolloProvider } from 'react-apollo';
import { ApolloClient } from 'apollo-client';
import { HttpLink } from 'apollo-link-http';
import {
  Router,
  Route,
  Redirect,
  Switch
} from 'react-router-dom';

import { history } from './stores/location';
import List from './views/List/List';
import Map from './views/Map';

const client = new ApolloClient({
  // By default, this client will send queries to the
  //  `/graphql` endpoint on the same host
  link: new HttpLink(),
  cache: new InMemoryCache()
});

const theme = {
  bodyColor: '#000',
  baseTextColor: '#fff'
};

export default function App() {
  return (
    <RadiumStarterRoot theme={theme}>
      <ApolloProvider client={client}>
        <Router history={history}>
          <Switch>
            <Route path="/map" component={Map}/>
            <Route path="/list" component={List}/>
            <Redirect from="/" to="/map"/>
          </Switch>
        </Router>
      </ApolloProvider>
    </RadiumStarterRoot>
  );
}
