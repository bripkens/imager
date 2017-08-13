const {getImage, getCountriesOverview} = require('../elasticsearch');

exports.image = ({id}) => getImage(id);

exports.countries = () => getCountriesOverview();
