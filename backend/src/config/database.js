const { Sequelize } = require("sequelize");
const mysql2 = require("mysql2");

function readBoolean(value, defaultValue = false) {
  if (value === undefined) {
    return defaultValue;
  }

  return value === "true";
}

function buildSslConfig() {
  const sslEnabled = readBoolean(process.env.DB_SSL, process.env.NODE_ENV === "production");

  if (!sslEnabled) {
    return undefined;
  }

  const ssl = {
    require: true,
    rejectUnauthorized: readBoolean(process.env.DB_SSL_REJECT_UNAUTHORIZED, false),
  };

  if (process.env.DB_SSL_CA) {
    ssl.ca = process.env.DB_SSL_CA.replace(/\\n/g, "\n");
  }

  return ssl;
}

const dialectOptions = {};
const ssl = buildSslConfig();

if (ssl) {
  dialectOptions.ssl = ssl;
}

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    dialect: "mysql",
    dialectModule: mysql2,
    dialectOptions,
    logging: false,
  }
);

module.exports = sequelize;
