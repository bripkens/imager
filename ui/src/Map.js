import { MarkerClusterer } from 'react-google-maps/lib/components/addons/MarkerClusterer';
import { GoogleMap, Marker, withGoogleMap } from "react-google-maps";
import { compose, withProps } from 'recompose';
import { graphql } from 'react-apollo';
import withSizes from 'react-sizes';
import gql from 'graphql-tag';
import React from 'react';


const query = gql`
query {
  cities {
    city
    numberOfPhotos
    location {
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
    containerElement: <div style={{ height: `${height}px` }} />,
    mapElement: <div style={{ height: `100%` }} />
  })),
  withGoogleMap,
  graphql(query)
)(Map);


function Map({data}) {
  console.log('Map:19 data', data);
  if (data.loading) {
    return (
      <div>
        Loading…
      </div>
    )
  }

  console.log('Map:44 data.cities', data.cities);

  return (
    <GoogleMap
      defaultZoom={2}
      defaultCenter={{ lat: 0, lng: 0 }}
    >
      <MarkerClusterer
        averageCenter
        enableRetinaIcons
        gridSize={60}
        calculator={calculateCluster}
      >
        {data.cities.filter(city => city.location).map(city =>
          <Marker
            key={city.city}
            label={{
              text: String(city.numberOfPhotos),
              numberOfPhotos: city.numberOfPhotos,
              fontSize: '12px'
            }}
            position={{
              lat: city.location.lat,
              lng: city.location.lon
            }}
          />
        )}
      </MarkerClusterer>
    </GoogleMap>
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