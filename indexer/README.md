# indexer
This components scans a given directory for images and indexes these images using their exif meta data and geo databases.

## Download
Exif data is read from the images and further transformed. In order to do this, a country and city database
is required. These databases can be downloaded for free from the [geonames.org](http://download.geonames.org/export/dump/)
website. More specifically, one of the `cities*.zip` files is required, e.g. [cities1000.zip](http://download.geonames.org/export/dump/cities1000.zip),
and the [countryInfo.txt](http://download.geonames.org/export/dump/countryInfo.txt) file.

## Install and Start
Configure the application by setting environment variables. Refer to `src/config.js` to read up on the variables.

```
yarn && yarn start
```
