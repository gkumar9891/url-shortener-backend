import { Sequelize } from 'sequelize'

// Create a new Sequelize instance (connect to MySQL)
const dbName = process.env.APP_DB_NAME!;
const dbUserName = process.env.APP_DB_USERNAME!;
const dbPassword = process.env.APP_DB_PASSWORD!;
const dbPort = process.env.APP_DB_PORT!

const sequelize = new Sequelize(dbName, dbUserName, dbPassword, {
  host: 'localhost',
  port: parseInt(dbPort),
  dialect: 'mysql', // Dialect for MySQL
});

export default sequelize;