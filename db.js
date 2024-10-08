/** Database setup for BizTime. */

require('dotenv').config(); // Load environment variables from .env file
const { Client } = require("pg");

let DB_URI;

// Determine the database URI based on the environment
if (process.env.NODE_ENV === "test") {
  DB_URI = `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}/${process.env.DB_TEST_NAME}`;
} else {
  DB_URI = `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}/${process.env.DB_NAME}`;
}

// Create a new client instance
const db = new Client({
  connectionString: DB_URI,
});

// Connect to the database
db.connect()
  .then(() => console.log("Connected to the database"))
  .catch(err => {
    console.error("Connection error", err.stack);
    process.exit(-1); // Exit the application on connection error
  });

// Export the db client for use in other modules
module.exports = db;
