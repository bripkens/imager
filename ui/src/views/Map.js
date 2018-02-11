import { MarkerClusterer } from 'react-google-maps/lib/components/addons/MarkerClusterer';
import { GoogleMap, Marker, withGoogleMap } from "react-google-maps";
import { connect } from '@bripkens/rxstore-react';
import { compose, withProps } from 'recompose';
import { graphql } from 'react-apollo';
import withSizes from 'react-sizes';
import gql from 'graphql-tag';
import React from 'react';

import TopBar, {height as topBarHeight} from '../components/TopBar/TopBar';
import { location$, mutateUrl } from '../stores/location';

const query = gql`
query cities($query: String) {
  cities(query: $query) {
    city
    numberOfPhotos
    coords {
      lat
      lon
    }
  }
}
`;


export default compose(
  withSizes(dimensions => dimensions),
  withProps(({height}) => ({
    loadingElement: <div style={{ height: `100%` }} />,
    containerElement: <div style={{ height: `${height - topBarHeight}px`, marginTop: `${topBarHeight}px` }} />,
    mapElement: <div style={{ height: `100%` }} />
  })),
  withGoogleMap,
  connect({
    query: location$.map(location => location.query.q || '')
  }),
  graphql(query, {
    options: {
      errorPolicy: 'all'
    }
  })
)(Map);


function Map({data}) {
  if (data.loading) {
    return (
      <React.Fragment>
        <TopBar />
        Loading…
      </React.Fragment>
    )
  }

  if (data.error) {
    console.error(data.error);
    return (
      <React.Fragment>
        <TopBar />
        Error!
      </React.Fragment>
    )
  }

  let map = null;

  return (
    <React.Fragment>
      <TopBar />
      <a href="javascript:false" style={{position: 'fixed', bottom: '10px', left: '10px'}} onClick={() => setBoundsQuery(map)}> Bla blub</a>
      <GoogleMap
        defaultZoom={2}
        defaultCenter={{ lat: 0, lng: 0 }}
        streetViewControl={false}
        ref={r => map = r}
      >
        <MarkerClusterer
          averageCenter
          enableRetinaIcons
          gridSize={60}
          calculator={calculateCluster}
        >
          {(data.cities || []).filter(city => city.coords).map(city =>
            <Marker
              key={city.city}
              label={{
                text: String(city.numberOfPhotos),
                numberOfPhotos: city.numberOfPhotos,
                fontSize: '12px'
              }}
              position={{
                lat: city.coords.lat,
                lng: city.coords.lon
              }}
              onClick={() => onClick(city)}
            />
          )}
        </MarkerClusterer>
      </GoogleMap>
    </React.Fragment>
  )
}


function calculateCluster(markers, numStyles) {
  let index = 0;
  const count = markers.length.toString();
  let dv = count;
  while (dv !== 0) {
    dv = parseInt(dv / 10, 10);
    index++;
  }

  const numberOfPicturesInCluster = markers.reduce((agg, marker) => agg + marker.label.numberOfPhotos, 0);

  return {
    text: String(numberOfPicturesInCluster),
    index: Math.min(index, numStyles),
    title: `${numberOfPicturesInCluster} pictures in this area`
  };
}


function onClick(city) {
  mutateUrl(location => {
    location.pathname = '/list';
    location.query.q = ((location.query.q || '') + ` geo.location:"${city.city}"`).trim();
  });
}


function setBoundsQuery(map) {
  const bounds = map.getBounds();
  const lat = [bounds.getNorthEast().lat(), bounds.getSouthWest().lat()]
    .sort(numberComparator)
    .map(v => v.toFixed(4));
  const lon = [bounds.getNorthEast().lng(), bounds.getSouthWest().lng()]
    .sort(numberComparator)
    .map(v => v.toFixed(4));

  const query = `geo.lat:>=${lat[0]} AND geo.lat:<=${lat[1]} AND geo.lon:>=${lon[0]} AND geo.lon:<=${lon[1]}`

  mutateUrl(location => {
    location.pathname = '/list';
    location.query.q = ((location.query.q || '') + ` ${query}`).trim();
  });
}


function numberComparator(a, b) {
  if (a === b) {
    return 0;
  } else if (a < b) {
    return -1;
  }
  return 1;
}
