import TopBar, {height as topBarHeight} from '../../components/TopBar/TopBar';
import { graphql } from 'react-apollo';
import { compose } from 'recompose';
import gql from 'graphql-tag';
import radium from 'radium';
import React from 'react';

import { getSrc, getSrcSet } from '../../service/image';

const styles = {
  wrapper: {
    base: {
      margin: `${topBarHeight + 16}px 1rem 1rem`,
      padding: 0
    }
  },

  img: {
    base: {
      maxWidth: '90vw',
      maxHeight: '90vh'
    }
  }
};


const query = gql`
query image($id: ID) {
  image(id: $id) {
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


export default compose(
  graphql(query, {
    options(props) {
      return {
        errorPolicy: 'all',
        variables: {
          id: props.match.params.id
        }
      };
    },
  }),
  radium
)(Detail);


function Detail({data: {error, loading, image}}) {
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
    <div style={styles.wrapper.base}>
      <TopBar />

      <img
        src={getSrc(image.id)}
        srcSet={getSrcSet(image.id, image.resizedVersions)}
        sizes={`100%`}
        style={styles.img.base}
      />
    </div>
  );
}
