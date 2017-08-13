const admin = require('admin');

const config = require('./config');
const {metricsCollection} = require('./measured');

admin.configure({
  http: config.admin.http,

  plugins: [
    require('admin-plugin-index')(),
    require('admin-plugin-report')(),
    require('admin-plugin-environment')(),
    require('admin-plugin-profile')(),
    require('admin-plugin-terminate')(),
    require('admin-plugin-config')({
      config
    }),
    require('admin-plugin-measured')({
      collection: metricsCollection
    })
  ]
});

admin.start();
