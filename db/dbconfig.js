// New: Use the 'pg' library for PostgreSQL
const { Pool } = require('pg'); 

// The Pool will automatically use the DATABASE_URL environment variable 
// for the connection string, which is the standard for Render and other cloud hosts.
const pool = new Pool({
    connectionString: process.env.DATABASE_URL, 
    
    // Set max connections (optional, but good practice)
    max: process.env.DB_CONNECTION_LIMIT || 10,

    // IMPORTANT for Render: Production databases require SSL/TLS.
    // The 'rejectUnauthorized: false' setting is often necessary when 
    // connecting to managed cloud databases (like Render's Postgres)
    // that use self-signed certificates.
    ssl: {
        rejectUnauthorized: false
    }
});

// We don't need a separate connection test here since we run a better one 
// in the main server file, but we export the ready-to-use pool.
module.exports = pool;
