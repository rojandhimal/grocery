const { envConfig } = require("./env.config");

module.exports = {
  local: {
    username: envConfig.MYSQL_USER,
    password: envConfig.MYSQL_PASS,
    database: envConfig.MYSQL_NAME,
    host: envConfig.MYSQL_HOST,
    dialect: "mysql",
    port: 3306,
    logging: Boolean(envConfig?.ENABLE_DB_LOGS),
  },
  dev: {
    username: envConfig.MYSQL_USER,
    password: envConfig.MYSQL_PASS,
    database: envConfig.MYSQL_NAME,
    host: envConfig.MYSQL_HOST,
    dialect: "mysql",
    port: 3306,
    logging: Boolean(envConfig?.ENABLE_DB_LOGS),
  },
  staging: {
    username: envConfig.MYSQL_USER,
    password: envConfig.MYSQL_PASS,
    database: envConfig.MYSQL_NAME,
    host: envConfig.MYSQL_HOST,
    dialect: "mysql",
    port: 3306,
  },
  prod: {
    username: envConfig.MYSQL_USER,
    password: envConfig.MYSQL_PASS,
    database: envConfig.MYSQL_NAME,
    host: envConfig.MYSQL_HOST,
    dialect: "mysql",
    port: 3306,
  },
};
