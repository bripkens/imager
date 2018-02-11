import { connect } from '@bripkens/rxstore-react';
import { graphql } from 'react-apollo';
import { compose } from 'recompose';
import gql from 'graphql-tag';
import radium from 'radium';
import React from 'react';

import TopBar, {height as topBarHeight} from '../../components/TopBar/TopBar';
import { location$ } from '../../stores/location';
import Image from './Image';

const query = gql`
query images($query: String) {
  images(query: $query) {
    id
    width
    height
    preview
    resizedVersions {
      width
    }
  }
}
`;


const styles = {
  list: {
    base: {
      margin: `${topBarHeight + 16}px 1rem 1rem`,
      padding: 0,
      listStyle: 'none'
    }
  },

  item: {
    base: {
      display: 'inline-block',
      padding: '8px'
    }
  }
};

export default compose(
  connect({
    query: location$.map(location => location.query.q || '')
  }),
  graphql(query, {
    options: {
      errorPolicy: 'all'
    }
  }),
  radium
)(Map);


function Map({data}) {
  if (data.loading) {
    return (
      <React.Fragment>
        <TopBar />
        Loading…
      </React.Fragment>
    )
  }

  if (data.error) {
    console.error(data.error);
    return (
      <React.Fragment>
        <TopBar />
        Error!
      </React.Fragment>
    )
  }

  return (
    <React.Fragment>
      <TopBar />

      <ul key="list" style={styles.list.base}>
        {(data.images || []).map(img =>
          <li key="item" style={styles.item.base} key={img.id}>
            <Image {...img} />
          </li>
        )}
      </ul>
    </React.Fragment>
  )
}
