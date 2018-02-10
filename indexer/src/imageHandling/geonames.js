const geokdbush = require('geokdbush');
const kdbush = require('kdbush');
const fs = require('fs-extra');

const config = require('../config');

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
  });
}

async function parseTsv(file) {
  const fileContent = await fs.readFile(file, {encoding: 'utf8'});
  return fileContent.split('\n')
    .filter(line => line.indexOf('#') !== 0)
    .map(line => line.split('\t'));
}

// Format from http://www.geonames.org/export/zip/
// country code      : iso country code, 2 characters
// postal code       : varchar(20)
// place name        : varchar(180)
// admin name1       : 1. order subdivision (state) varchar(100)
// admin code1       : 1. order subdivision (state) varchar(20)
// admin name2       : 2. order subdivision (county/province) varchar(100)
// admin code2       : 2. order subdivision (county/province) varchar(20)
// admin name3       : 3. order subdivision (community) varchar(100)
// admin code3       : 3. order subdivision (community) varchar(20)
// latitude          : estimated latitude (wgs84)
// longitude         : estimated longitude (wgs84)
// accuracy          : accuracy of lat/lng from 1=estimated to 6=centroid
async function parseCityInfo() {
  const parseResult = await parseTsv(config.geonames.zipFile);
  parseResult.forEach(row => {
    const lat = row[9];
    const lon = row[10];

    // we need lat&lon in order to execute spatial searches
    if (lat == null || lon == null) {
      return;
    }

    const countryCode = row[0];
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
      coords: {
        lat: Number(lat),
        lon: Number(lon)
      },
      city: row[2],
      county: row[3],
      country: countryName,
      continent: continentName,
    });
  });
}

function buildSpatialIndex() {
  index = kdbush(cities, p => p.coords.lon, p => p.coords.lat);
}

exports.searchForGeoLocation = (lat, lon) => {
  const nearest = geokdbush.around(index, lon, lat, 1);
  if (nearest && nearest.length > 0) {
    return nearest[0]
  }
  return null;
};
