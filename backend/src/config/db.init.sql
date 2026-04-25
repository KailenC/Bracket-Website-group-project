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

-- password "password123" hashed
INSERT INTO users (first_name, last_name, username, email, password) VALUES
('Kailen', 'C', 'kailen', 'kailen@example.com', '$2a$10$YTdHpu4Xajkz0jDMfbcm..ZQwsNSHwBvJfRUJlsj9WT007fcYGObe'),
('Alice', 'Smith', 'OKC', 'alice@example.com', '$2a$10$7QJ8zQZlZkz1QW5ZQJz7UeQxQ5z9Jrj0YFQyZp6G5rKQ8kzXkzXkG'),
('Bob', 'Jones', 'Spurs', 'bob@example.com', '$2a$10$7QJ8zQZlZkz1QW5ZQJz7UeQxQ5z9Jrj0YFQyZp6G5rKQ8kzXkzXkG'),
('Charlie', 'Brown', 'Lakers', 'charlie@example.com', '$2a$10$7QJ8zQZlZkz1QW5ZQJz7UeQxQ5z9Jrj0YFQyZp6G5rKQ8kzXkzXkG'),
('Alitce', 'Smtith', 'Nuggets', 'alicte@example.com', '$2a$10$7QJ8zQZlZkz1QW5ZQJz7UeQxQ5z9Jrj0YFQyZp6G5rKQ8kzXkzXkG'),
('Michael', 'Brown', 'Wolves', 'mike.brown@example.com', '$2a$10$7QJ8zQZlZkz1QW5ZQJz7UeQxQ5z9Jrj0YFQyZp6G5rKQ8kzXkzXkG'),
('Sarah', 'Johnson', 'Rockets', 'sarah.j@example.com', '$2a$10$7QJ8zQZlZkz1QW5ZQJz7UeQxQ5z9Jrj0YFQyZp6G5rKQ8kzXkzXkG'),
('D3avid', 'Lede', 'Suns', 'dadvid.lee@example.com', '$2a$10$7QJ8zQZlZkz1QW5ZQJz7UeQxQ5z9Jrj0YFQyZp6G5rKQ8kzXkzXkG'),
('Dgavid', 'Lgee', 'Blazers', 'dgavid.lee@example.com', '$2a$10$7QJ8zQZlZkz1QW5ZQJz7UeQxQ5z9Jrj0YFQyZp6G5rKQ8kzXkzXkG'),
('Daevid', 'Leee', 'dleee', 'daveid.lee@example.com', '$2a$10$7QJ8zQZlZkz1QW5ZQJz7UeQxQ5z9Jrj0YFQyZp6G5rKQ8kzXkzXkG'),
('Dajvid', 'Leej', 'dleje', 'davjid.lee@example.com', '$2a$10$7QJ8zQZlZkz1QW5ZQJz7UeQxQ5z9Jrj0YFQyZp6G5rKQ8kzXkzXkG'),
('Davyid', 'yLee', 'dlyee', 'dayvid.lee@example.com', '$2a$10$7QJ8zQZlZkz1QW5ZQJz7UeQxQ5z9Jrj0YFQyZp6G5rKQ8kzXkzXkG');

INSERT INTO tournaments (name, host_id, status, type, max_players)
VALUES ('Test-WesternConfrence', 1, 'open', 'Single Elimination', 8);

INSERT INTO tournament_players (tournament_id, user_id, seed) VALUES
(1, 2, 2),
(1, 3, 1),
(1, 4, 5),
(1, 5, 4),
(1, 6, 3),
(1, 7, 6),
(1, 8, 8),
(1, 9, 7);
