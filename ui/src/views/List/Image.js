import { compose } from "recompose";
import radium from "radium";
import React from "react";

export default compose(radium)(Image);

const desiredWidth = 200;
const desiredHeight = 150;

const styles = {
  wrapper: {
    base: {
      overflow: "hidden",
      position: 'relative',
      display: 'block'
    }
  },

  preview: {
    base: {
    }
  },

  source: {
    base: {
    }
  }
};

function Image({ id, preview, width, height, resizedVersions }) {
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

  const sourceImagePath = `/images/${id}`;
  const srcset = resizedVersions
    .map(({width}) => `${sourceImagePath}/${width} ${width}w`)
    .join(',\n');

  return (
    <a key="wrapper" style={[styles.wrapper.base, {
      width: `${targetWidth}px`,
      height: `${targetHeight}px`
    }]} href={sourceImagePath}>
      <img
        key="preview"
        style={[
          styles.preview.base,
          imagePositionAndSize
        ]}
        src={preview}
        alt="Preview"
      />
      <img
        key="source"
        style={[
          styles.source.base,
          imagePositionAndSize
        ]}
        srcSet={srcset}
        sizes={`${desiredWidth}px`}
        src={sourceImagePath}
        alt="Source"
      />
    </a>
  );
}
