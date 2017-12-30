import radium from 'radium';
import React from 'react';

import Query from './Query';

export const height = 40;

const styles = {
  base: {
    background: '#252830',
    position: 'fixed',
    top: '0px',
    left: '0px',
    right: '0px',
    height: `${height}px`,
    display: 'flex',
    alignItems: 'center',
    padding: '0 1rem'
  }
};

export default radium(TopBar);

function TopBar() {
  return  (
    <div style={styles.base}>
      <Query />
    </div>
  );
}