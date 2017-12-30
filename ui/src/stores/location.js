import createHashHistory from 'history/createHashHistory';
import {createStore} from '@bripkens/rxstore';
import qs from 'qs';

export const history = createHashHistory();

const store = createStore({
  name: 'location',

  getInitialState() {
    return parseWithQueryString(history.location);
  },

  actions: {
    set(currentLocation, newLocation) {
      return newLocation;
    }
  }
});

history.listen(location => store.actions.set(parseWithQueryString(location)));

function parseWithQueryString(location) {
  location.query = qs.parse((location.search || '').replace(/^\?/, ''));
  return location;
}


export const location$ = store.observable;

export function setQueryString(k, v) {
  store.observable.take(1).subscribe(location => {
    if (location.query[k] !== v) {
      const query = {
        ...location.query,
        [k]: v
      };

      history.push({
        pathname: location.pathname,
        search: `?${qs.stringify(query)}`
      })
    }
  });
}