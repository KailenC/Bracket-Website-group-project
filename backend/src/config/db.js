const { Pool } = require("pg");

// PostgreSQL connection
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

module.exports = pool;

// IDEA for DB structure
/*
CREATE TABLE tournaments (id int PRIMARY KEY, name varchar(100), host_id int, status varchar(100), type varchar(100), max_players int);
CREATE TABLE tournaments_players(id int PRIMARY KEY, tournament_id int, user_id int);
CREATE TABLE tournaments_matches(id int PRIMARY KEY, tournament_id int, player1_id int, player2_id int, winner int, round int);
*/