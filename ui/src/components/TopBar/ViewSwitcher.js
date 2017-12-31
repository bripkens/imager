import radium from 'radium';
import React from 'react';

import ViewItem from './ViewItem';

const styles = {
  base: {
    
  }
}

export default radium(ViewSwitcher);

function ViewSwitcher() {
  return (
    <div>
      <ViewItem pathname="/map">
        Map
      </ViewItem>
      <ViewItem pathname="/list">
        List
      </ViewItem>
    </div>
  );
}