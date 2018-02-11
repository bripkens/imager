import { connect } from '@bripkens/rxstore-react';
import { compose } from 'recompose';
import radium from 'radium';
import React from 'react';

import { getSrc, getSrcSet } from '../../service/image';
import { getUrl$ } from '../../stores/location';

export default compose(
  connect(({ id }) => ({
    url: getUrl$(location => (location.pathname = `/images/${id}`))
  })),
  radium
)(Image);

const desiredWidth = 200;
const desiredHeight = 150;

const styles = {
  wrapper: {
    base: {
      overflow: 'hidden',
      position: 'relative',
      display: 'block'
    }
  },

  preview: {
    base: {}
  },

  source: {
    base: {}
  }
};

function Image({ id, preview, width, height, resizedVersions, url }) {
  const aspectRatio = width / height;
  const landscape = aspectRatio > 1;
  const targetWidth = landscape ? desiredWidth : desiredHeight * aspectRatio;
  const targetHeight = landscape ? desiredWidth * (1 / aspectRatio) : desiredHeight;

  const imagePositionAndSize = {
    width: `${targetWidth}px`,
    height: `${targetHeight}px`,
    left: 0,
    top: 0,
    position: 'absolute'
  };

  return (
    <a
      key="wrapper"
      style={[
        styles.wrapper.base,
        {
          width: `${targetWidth}px`,
          height: `${targetHeight}px`
        }
      ]}
      href={url}
    >
      <img key="preview" style={[styles.preview.base, imagePositionAndSize]} src={preview} alt="Preview" />
      <img
        key="source"
        style={[styles.source.base, imagePositionAndSize]}
        src={getSrc(id)}
        srcSet={getSrcSet(id, resizedVersions)}
        sizes={`${desiredWidth}px`}
        alt="Source"
      />
    </a>
  );
}
