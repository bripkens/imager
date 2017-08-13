const admin = require('admin');

const config = require('./config');

exports.start = () => {
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
      require('admin-plugin-healthcheck')({
        checks: {
          // Define multiple healthchecks which check critical components
          // in the system. The following example shows valid return values.
          elasticsearch: require('./elasticsearch').healthcheck
        }
      })
    ]
  });

  admin.start();
};
