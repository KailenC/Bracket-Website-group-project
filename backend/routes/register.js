const express = require('express');
const router = express.Router();
const { Pool } = require("pg"); //server thing

// PostgreSQL connection
const pool = new Pool({
  user: "postgres",        
  host: "localhost",
  database: "usersdb",  
  password: "",    
  port: 5432,   
});

// Registration route
router.post('/', async (req, res) => {
  const { first_name, last_name, username, email, password } = req.body;

  // Basic validation
  if (!first_name || !last_name || !username || !email || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }
  if (typeof password !== 'string' || password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }

  try {
    // Save to PostgreSQL without hashing
    const result = await pool.query(
      `INSERT INTO users (first_name, last_name, username, email, password)
       VALUES ($1, $2, $3, $4, $5) RETURNING id, first_name, last_name, username, email, password`,
      [first_name, last_name, username, email, password]
    );

    res.status(201).json({ message: 'User registered', user: result.rows[0] });
  } catch (err) {
    console.error(err.message);
    // Handle duplicate username/email
    if (err.code === '23505') { 
      return res.status(400).json({ error: 'Username or email already exists' });
    }
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;