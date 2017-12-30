# indexer
This components scans a given directory for images and indexes these images using their exif meta data and geo databases.

## Download
Exif data is read from the images and further transformed. In order to do this, extra databases
are required. These databases can be downloaded for free from the [geonames.org](http://download.geonames.org/export/dump/)
website. More specifically:

- the [countryInfo.txt](http://download.geonames.org/export/dump/countryInfo.txt) file
- the [zip codes codes](http://www.geonames.org/export/zip/allCountries.zip) file

## Install and Start
Configure the application by setting environment variables. Refer to `src/config.js` to read up on the variables.

```
yarn && yarn start
```
