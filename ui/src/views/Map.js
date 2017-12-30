import { MarkerClusterer } from 'react-google-maps/lib/components/addons/MarkerClusterer';
import { GoogleMap, Marker, withGoogleMap } from "react-google-maps";
import { compose, withProps } from 'recompose';
import { graphql } from 'react-apollo';
import withSizes from 'react-sizes';
import gql from 'graphql-tag';
import React from 'react';

import TopBar, {height as topBarHeight} from '../components/TopBar/TopBar';
import { location$ } from '../stores/location';
import connect from '../hoc/connect';

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

  return (
    <React.Fragment>
      <TopBar />
      <GoogleMap
        defaultZoom={2}
        defaultCenter={{ lat: 0, lng: 0 }}
        streetViewControl={false}
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
  console.log('Map:101 city', city);
}