const {getImage, getImages, getCitiesOverview} = require('../elasticsearch');

exports.image = ({id}) => getImage(id);
exports.images = ({query}) => getImages(query);
exports.cities = ({query}) => getCitiesOverview(query);
