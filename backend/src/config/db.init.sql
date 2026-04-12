-- DELETE PREVIOUS TABLES
DROP TABLE IF EXISTS matches CASCADE;
DROP TABLE IF EXISTS tournament_players CASCADE;
DROP TABLE IF EXISTS tournaments CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- CREATE TABLES
CREATE TABLE users ( 
  id SERIAL PRIMARY KEY, 
  first_name VARCHAR(50), 
  last_name VARCHAR(50), 
  username VARCHAR(50) UNIQUE, 
  email VARCHAR(100) UNIQUE, 
  password TEXT 
);

CREATE TABLE tournaments (
  id SERIAL PRIMARY KEY, 
  name varchar(100), 
  host_id INT REFERENCES users(id), 
  status varchar(50), 
  type varchar(50), 
  max_players INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE tournament_players (
  id SERIAL PRIMARY KEY, 
  tournament_id INT REFERENCES tournaments(id) ON DELETE CASCADE, 
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  seed INT, --cascade somehow? ts up to u kailen
  UNIQUE (tournament_id, user_id)
);

CREATE TABLE matches (
  id SERIAL PRIMARY KEY, 
  tournament_id INT REFERENCES tournaments(id) ON DELETE CASCADE, 
  player1_id INT REFERENCES users(id), 
  player2_id INT REFERENCES users(id),
  score1 INT,
  score2 INT, 
  winner_id INT REFERENCES users(id), 
  round INT,
  match_number INT,
  status VARCHAR(50)
);

-- SEED DATA 
