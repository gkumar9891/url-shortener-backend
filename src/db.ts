import { Sequelize } from 'sequelize'

// Create a new Sequelize instance (connect to MySQL)
const dbName:string = process.env.APP_DB_NAME! as string;
const dbUserName:string = process.env.APP_DB_USERNAME! as string;
const dbPassword:string = process.env.APP_DB_PASSWORD! as string;
const dbPort:string = process.env.APP_DB_PORT! as string;
const dbHost:string = process.env.APP_DB_HOST! as string;
const dbUrl:string = process.env.APP_DB_URL! as string;

// const sequelize = new Sequelize(dbName, dbUserName, dbPassword, {
//   host: dbHost,
//   port: parseInt(dbPort),
//   dialect: 'postgres', // Dialect for MySQL
// });

let sequelize: Sequelize;

if(dbUrl) {
   sequelize = new Sequelize(dbUrl);
} else {
  sequelize = new Sequelize(dbName, dbUserName, dbPassword, {
    host: dbHost,
    port: parseInt(dbPort),
    dialect: 'mysql', // Dialect for MySQL
  });
}


export default sequelize;