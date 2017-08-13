const {getImage} = require('../elasticsearch');

exports.image = async ({id}) => getImage(id);
