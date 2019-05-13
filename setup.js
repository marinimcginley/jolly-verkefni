require('dotenv').config();

const fs = require('fs');
const util = require('util');

const { query } = require('./utils/db');

const connectionString = process.env.DATABASE_URL;

const readFileAsync = util.promisify(fs.readFile);


async function main() {
  console.info(`Set upp gagnagrunn á ${connectionString}`);
  // droppa töflum ef til
  await query('DROP TABLE IF EXISTS users CASCADE');
  await query('DROP TABLE IF EXISTS friends CASCADE');
  await query('DROP TABLE IF EXISTS events CASCADE');
  await query('DROP TABLE IF EXISTS dates CASCADE');
  await query('DROP TABLE IF EXISTS userDates CASCADE');
  console.info('Töflum eytt');

  // búa til töflur út frá skema
  try {
    const createTable = await readFileAsync('./schema.sql');

    await query(createTable.toString('utf8'));
    console.info('Töflur búnar til');
  } catch (e) {
    console.error('Villa við að búa til töflur:', e.message);
    return;
  }
}

main().catch((err) => {
  console.error(err);
});
