import { connect } from '@bripkens/rxstore-react';
import { graphql } from 'react-apollo';
import { compose } from 'recompose';
import gql from 'graphql-tag';
import radium from 'radium';
import React from 'react';

import TopBar, {height as topBarHeight} from '../../components/TopBar/TopBar';
import { location$ } from '../../stores/location';
import Image from './Image';

const pageSize = 200;

const query = gql`
query images($query: String, $page: Int) {
  images(query: $query, page: $page, pageSize: ${pageSize}) {
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
      listStyle: 'none',
      display: 'flex',
      flexWrap: 'wrap',
      justifyContent: 'center',
      alignItems: 'center'
    }
  },

  item: {
    base: {
      display: 'inline-block',
      padding: '2px',
      flexShrink: 0
    }
  }
};

export default compose(
  connect({
    query: location$.map(location => location.query.q || '')
  }),
  graphql(query, {
    options(props) {
      return {
        errorPolicy: 'all',
        variables: {
          query: props.query,
          page: 1
        }
      };
    },
    props({data: {loading, error, images, fetchMore}}) {
      console.log('props', arguments);
      return {
        loading,
        error,
        images,
        loadMore() {
          console.log('###############################################');
          return fetchMore({
            variables: {
              page: Math.round(images.length / pageSize) + 1
            },
            updateQuery(previousResult, { fetchMoreResult }) {
              console.log('updateQuery', arguments);
              if (!fetchMoreResult) { return previousResult; }
              return Object.assign({}, previousResult, {
                // Append the new feed results to the old one
                images: [...previousResult.images, ...fetchMoreResult.images]
              });
            },
          });
        },
      };
    }
  }),
  radium
)(List);


function List({loading, error, images=[], loadMore}) {
  if (loading) {
    return (
      <React.Fragment>
        <TopBar />
        Loading…
      </React.Fragment>
    )
  }

  if (error) {
    console.error(error);
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

      <ul style={styles.list.base}>
        {images.map(img =>
          <li style={styles.item.base} key={img.id}>
            <Image {...img} key={img.id} />
          </li>
        )}
      </ul>

      <a href="javascript:false" onClick={() => loadMore()}>Load more</a>
    </React.Fragment>
  )
}
