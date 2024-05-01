const { AWSXRay } = require("./xray");

// const AWSXRay = require("aws-xray-sdk");
const { Pool } = AWSXRay.capturePostgres(require("pg"));

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  ssl: {
    rejectUnauthorized: false, // For RDS, you may need this depending on SSL settings
  },
});

async function getUserById(userId) {
  try {
    const query = "SELECT * FROM users WHERE cognito_user_id = $1";
    const { rows } = await pool.query(query, [userId]);

    if (rows.length > 0) {
      console.log("User Found:", rows[0]);
      return rows[0]; // Return the first user found
    } else {
      console.log("No user found with that ID");
      return null; // Return null if no user found
    }
  } catch (err) {
    console.error("Error executing query:", err.stack);
    throw new Error("Database operation failed");
  }
}

module.exports = {
  getUserById,
};
