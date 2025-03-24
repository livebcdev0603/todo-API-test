const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME || "todo_app",
  process.env.DB_USERNAME || "postgres",
  process.env.DB_PASSWORD || "postgres",
  {
    host: process.env.DB_HOST || '127.0.0.1',
    dialect: 'postgres',
    logging: process.env.NODE_ENV === "developement" ? console.log : false,
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000,
      },
    dialectOptions: {
        ssl: process.env.NODE_ENV === "development" ? false : true,
    }
  },
  
);

// Test the connection
async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('Connection to PostgreSQL has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
}

// Close the connection
const closeConnection = async () => {
    try {
        await sequelize.close();
        console.log("Database connection closed successfully");
    } catch(error) {
        console.error("Error closing database connection: ", error);
    }
}

module.exports = { sequelize, testConnection, closeConnection };
