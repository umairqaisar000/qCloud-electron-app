const { Pool } = window.require('pg')
// const session = window.require('express-session');
// const pgSession = window.require('connect-pg-simple')(session); // Install connect-pg-simple package for session store

const pool = new Pool({
  user: 'qcloud_dev_admin',
  host: 'ec2-18-212-246-50.compute-1.amazonaws.com',
  database: 'qcloud-dev',
  password: '0D9e4Fvc!9YD'
})

// const sessionStore = new pgSession({
//   pool, // Use the same pool connection
//   tableName: 'session', // Create a table named 'session' to store session data in the database
// });

module.exports = {
  pool,
};

