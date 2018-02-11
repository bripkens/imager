const {getImage, getImages, getCitiesOverview} = require('../elasticsearch');

exports.image = ({id}) => getImage(id);
exports.images = getImages;
exports.cities = ({query}) => getCitiesOverview(query);
