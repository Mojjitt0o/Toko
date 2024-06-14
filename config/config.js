require("dotenv").config();
const fs = require('fs')
module.exports = {
  development: {
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST || "127.0.0.1",
    port: process.env.DB_PORT || "5432",
    dialect: process.env.DB_DIALECT || "postgres",
  },
  test: {
    username: process.env.DB_TEST_USERNAME,
    password: process.env.DB_TEST_PASSWORD,
    database: process.env.DB_TEST_NAME,
    host: process.env.DB_TEST_HOST || "127.0.0.1",
    port: process.env.DB_TEST_PORT || "5432",
    dialect: process.env.DB_TEST_DIALECT || "postgres",
    logging: false // Tambahkan ini untuk mematikan logging,
  },
  production: {
    username: process.env.DB_PROD_USERNAME,
    password: process.env.DB_PROD_PASSWORD,
    database: process.env.DB_PROD_NAME,
    host: process.env.DB_PROD_HOST || "127.0.0.1",
    port: process.env.DB_PROD_PORT || "5432",
    dialect: process.env.DB_PROD_DIALECT || "postgres",
    dialectModule: require('pg'),
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: true,
        ca: fs.readFileSync(__dirname + '/root.crt').toString(),
      }
    }
  },
};
