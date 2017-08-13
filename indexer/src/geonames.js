const logger = require('get-logger')('indexer:geonames');
const Promise = require('bluebird');
const fs = Promise.promisifyAll(require('fs'));
const geokdbush = require('geokdbush');
const kdbush = require('kdbush');
const path = require('path');

const config = require('./config');

const continents = {
  AF: 'Africa',
  AS: 'Asia',
  EU: 'Europe',
  NA: 'North America',
  OC: 'Oceania',
  SA: 'South America',
  AN: 'Antarctic'
};
const countries = {};
const cities = [];
let index;

exports.start = async () => {
  await parseCountryInfo();
  await parseCityInfo();
  buildSpatialIndex();
};

async function parseCountryInfo() {
  const parseResult = await parseTsv(config.geonames.countryFile);
  parseResult.forEach(row => {
    countries[row[0]] = {
      name: row[4],
      continent: continents[row[8]]
    };
  })
}

async function parseTsv(file) {
  const fileContent = await fs.readFileAsync(file, {encoding: 'utf8'});
  return fileContent.split('\n')
    .filter(line => line.indexOf('#') !== 0)
    .map(line => line.split('\t'));
}

async function parseCityInfo() {
  const parseResult = await parseTsv(config.geonames.citiesFile);
  parseResult.forEach(row => {
    const lat = row[4];
    const lon = row[5];

    // we need lat&lon in order to execute spatial searches
    if (lat == null || lon == null) {
      return;
    }

    const countryCode = row[8];
    let countryName;
    let continentName;
    if (countryCode) {
      const country = countries[countryCode];
      if (country) {
        countryName = country.name;
        continentName = country.continent;
      }
    }

    cities.push({
      city: row[1],
      lat: Number(lat),
      lon: Number(lon),
      country: countryName,
      continent: continentName,
    });
  });
}

function buildSpatialIndex() {
  index = kdbush(cities, p => p.lon, p => p.lat);
}

exports.searchForGeoLocation = (lat, lon) => {
  const nearest = geokdbush.around(index, lon, lat, 1);
  if (nearest && nearest.length > 0) {
    return nearest[0]
  }
  return null;
};
