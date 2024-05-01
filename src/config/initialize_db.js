require("dotenv").config();

const { Client } = require("pg");

const client = new Client({
  user: process.env.DB_USER, // Your RDS username
  password: process.env.DB_PASSWORD, // Your RDS password
  host: process.env.DB_HOST, // Your RDS endpoint
  database: process.env.DB_NAME, // Your database name
  port: DB_PORT, // Default port for PostgreSQL, change if different
  ssl: {
    rejectUnauthorized: false, // For RDS, you may need this depending on SSL settings
  },
});

const createTableQuery = `
  CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    cognito_user_id VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
  );
`;

async function initializeDB() {
  try {
    await client.connect();
    await client.query(createTableQuery);
    console.log("Table created successfully");
  } catch (err) {
    console.error("Failed to create table:", err);
  } finally {
    await client.end();
  }
}

initializeDB();
