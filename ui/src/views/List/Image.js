import { compose } from "recompose";
import radium from "radium";
import React from "react";

export default compose(radium)(Image);

const desiredWidth = 200;
const desiredHeight = 160;

const styles = {
  wrapper: {
    base: {
      width: `${desiredWidth}px`,
      height: `${desiredHeight}px`,
      overflow: "hidden",
      position: 'relative'
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

function Image({ id, preview, width, height }) {
  const aspectRatio = width / height;
  const landscape = aspectRatio > 1;
  const targetWidth = landscape ? aspectRatio * desiredWidth : desiredWidth;
  const targetHeight = landscape ? desiredHeight : (1 / aspectRatio) * desiredHeight;

  const imagePositionAndSize = {
    width: `${targetWidth}px`,
    height: `${targetHeight}px`,
    left: `${(targetWidth - desiredWidth) / -2}px`,
    top: `${(targetHeight - desiredHeight) / -2}px`,
    position: 'absolute'
  };

  const sourceImage = `/images/${id}`;

  return (
    <div key="wrapper" style={styles.wrapper.base} href={sourceImage}>
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
        src={sourceImage}
        alt="Source"
      />
    </div>
  );
}
