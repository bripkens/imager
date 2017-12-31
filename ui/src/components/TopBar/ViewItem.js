import { connect } from '@bripkens/rxstore-react';
import { compose } from 'recompose';
import radium from 'radium';
import React from 'react';

import { location$, getUrl$ } from '../../stores/location';

const styles = {
  base: {
    color: '#fff',
    fontSize: '0.8rem',
    padding: '.2rem'
  },
  
  active: {
    color: 'orange'
  }
}

export default compose(connect(props => ({
  isActive: location$.map(location => location.pathname.indexOf(props.pathname) === 0),
  href: getUrl$(location => location.pathname = props.pathname)
})), radium)(ViewItem);

function ViewItem({isActive, children, href}) {
  return (
    <a href={href} style={[
      styles.base,
      isActive && styles.active
    ]}>{children}</a>
  );
}