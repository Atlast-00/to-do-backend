const Knex = require('knex') 

const { PG_HOST, PG_PORT, PG_USER, PG_PASS, PG_DB } = process.env;

const connectDB = async () => {
  const knex = await Knex({
    client: 'pg',
    connection: {
      host: PG_HOST,
      port: PG_PORT,
      user: PG_USER,
      password: PG_PASS,
      database: PG_DB
    },
    migrations: {
      directory: './src/migrations'
    },
    pool: { min: 0, max: 7 }
  });

  knex.migrate.latest()
    .then((_migrate) => console.log('migrations success'))
    .catch((error) => console.log('migrations error', error))

  return knex
}

module.exports = { connectDB };
