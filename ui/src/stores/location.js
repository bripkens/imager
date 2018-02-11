import createHashHistory from 'history/createHashHistory';
import {createStore} from '@bripkens/rxstore';
import {cloneDeep} from 'lodash';
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
      });
    }
  });
}


export function mutateUrl(mutator) {
  store.observable.take(1).subscribe(location => {
    location = cloneDeep(location);
    mutator(location);
    console.log(location);
    history.push({
      pathname: location.pathname,
      search: `?${qs.stringify(location.query)}`
    });
  });
}


export function getUrl$(mutator) {
  return store.observable
    .map(location => {
      location = cloneDeep(location);
      mutator(location);
      return stringify(location);
    })
    .distinctUntilChanged();
}


function stringify(location) {
  return `/#${location.pathname}${getQuery(location.query)}`;
}

function getQuery(query) {
  if (!query) {
    return '';
  }

  let result = '';
  let first = true;
  for (let key in query) {
    if (first) {
      result += '?';
      first = false;
    } else {
      result += '&';
    }

    const value = query[key];
    if (value == null || value === '') {
      result += `${encodeURIComponent(key)}`;
    } else {
      result += `${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
    }
  }

  return result;
}
