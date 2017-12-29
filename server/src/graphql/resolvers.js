const {getImage, getCitiesOverview} = require('../elasticsearch');

exports.image = ({id}) => getImage(id);

exports.cities = () => getCitiesOverview();