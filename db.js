const mysql = require("mysql2/promise");
require("dotenv").config();

async function DatabaseSet() {
  try {
    connection = await mysql.createConnection({
      host: process.env.HOST,
      user: process.env.USER,
      password: process.env.PASSWORD,
      database: process.env.DATABASE,
    });

    return connection;
  } catch (err) {
    console.log("Error:", err.message);
  }
}

module.exports = DatabaseSet;
