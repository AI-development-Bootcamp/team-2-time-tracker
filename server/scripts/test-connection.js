const { Client } = require('pg');

const connectionString = "postgresql://time_track_db_lxwy_user:X1q3Dft63p6KsIqSjRMRIcF7qT6mIpv7@dpg-d5kd2cbe5dus73a6m440-a.frankfurt-postgres.render.com/time_track_db_lxwy";

const client = new Client({
  connectionString,
  ssl: {
    rejectUnauthorized: false
  }
});

console.log('Attempting to connect to database...');

client.connect()
  .then(() => {
    console.log('Connected successfully!');
    return client.query('SELECT NOW() as now, current_user as user, current_database() as db');
  })
  .then(res => {
    console.log('Query result:', res.rows[0]);
    return client.end();
  })
  .catch(err => {
    console.error('Connection error:', err);
    process.exit(1);
  });
