const pool = require("../config/db");

const getMatch = async ({ tournament, game, player1, player2 }) => {
  const result = await db.query(
    `SELECT * FROM matches 
     WHERE tournament = $1 AND game = $2 
     AND player1 = $3 AND player2 = $4`,
    [tournament, game, player1, player2]
  );
  return result.rows[0];
};

const updateMatch = async ({ tournament, game, player1, player2, wins1, wins2, seriesWinner, complete }) => {
  const result = await db.query(
    `UPDATE matches 
     SET wins1 = $1, wins2 = $2, series_winner = $3, complete = $4
     WHERE tournament = $5 AND game = $6 AND player1 = $7 AND player2 = $8
     RETURNING *`,
    [wins1, wins2, seriesWinner, complete, tournament, game, player1, player2]
  );
  return result.rows[0];
};