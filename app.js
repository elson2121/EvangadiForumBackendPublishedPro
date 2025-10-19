const express = require("express");
const app = express();
// Read port from environment variable for cloud hosting, defaulting to 5000
const port = process.env.PORT || 5000; 
const cors = require("cors");
const authMiddleware = require("./middleware/authMiddleware");
require("dotenv").config();

//import db - Renamed to 'pool' and imported the PostgreSQL connection pool
const pool = require("./db/dbconfig"); 

//import Routes middleware
const userRoutes = require("./Routes/userRoutes");
const questionRoutes = require("./Routes/questionRoute");
const answerRoutes = require("./Routes/answerRoutes");
const askgpt = require("./Routes/questionRoute");

//middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// routes middle-ware
app.use("/api/user", userRoutes);
app.use("/api/questions", authMiddleware, questionRoutes);
app.use("/api/answer", authMiddleware, answerRoutes);
app.use("/api/chatgpt", askgpt);

// Simple route to test
app.get("/", (req, res) => {
  res.send(`<h1>Response is sent successfully</h1><p>Server running on port ${port}</p>`);
});

//connection test and server start
const start = async () => {
  try {
    // Check PostgreSQL connection: 'SELECT 1' is a standard, efficient test query
    // Use 'pool.query' from the imported 'pg' pool instead of MySQL's 'execute'
    await pool.query("SELECT 1");
    
    //Listen on port
    await app.listen(port, () => {
        console.log(`Database connection successful (PostgreSQL) 🎉 Server listening on port ${port}`);
    });
  } catch (err) {
    // If the database fails to connect, log the error and stop the process
    console.error("Database initialization failed 💥:", err.message);
    // CRITICAL: Exit the process so cloud host (Render) doesn't deploy a non-functional service
    process.exit(1); 
  }
};

start();

// app.listen(port, (err) => {
//   console.log("connected http://localhost:5000");
// })
