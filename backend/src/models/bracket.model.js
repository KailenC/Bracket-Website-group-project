const pool = require("../config/db");

const getMatch = async ({ tournament_id, round, player1Id, player2Id }) => {
  const result = await pool.query(
    `SELECT * FROM matches 
     WHERE tournament_id = $1 AND round = $2 
     AND player1_id = $3 AND player2_id = $4`,
    [tournament_id, round, player1Id, player2Id],
  );
  return result.rows[0];
};

const getMatchById = async (matchId) => {
  const result = await pool.query(`SELECT * FROM matches WHERE id = $1`, [
    matchId,
  ]);
  return result.rows[0];
};

const updateMatch = async ({
  tournament_id,
  round,
  player1Id,
  player2Id,
  score1,
  score2,
  winnerId,
  status,
}) => {
  const result = await pool.query(
    `UPDATE matches 
     SET score1 = $1, score2 = $2, winner_id = $3, status = $4
     WHERE tournament_id = $5 AND round = $6 AND player1_id = $7 AND player2_id = $8
     RETURNING *`,
    [
      score1,
      score2,
      winnerId,
      status,
      tournament_id,
      round,
      player1Id,
      player2Id,
    ],
  );
  return result.rows[0];
};

// Finds the next round match slot the winner should go into
const getNextMatch = async ({ tournament_id, currentRound, matchNumber }) => {
  const nextRound = currentRound + 1;
  const nextMatchNumber = Math.ceil(matchNumber / 2);

  const result = await pool.query(
    `SELECT * FROM matches 
     WHERE tournament_id = $1 AND round = $2 AND match_number = $3`,
    [tournament_id, nextRound, nextMatchNumber],
  );
  return result.rows[0];
};

// Slots the winner into player1 or player2 of the next match
const assignPlayerToMatch = async ({ matchId, playerId, slot }) => {
  const column = slot === 1 ? "player1_id" : "player2_id";
  const result = await pool.query(
    `UPDATE matches SET ${column} = $1 WHERE id = $2 RETURNING *`,
    [playerId, matchId],
  );
  return result.rows[0];
};

const getHostID = async (tournament_id) => {
  const result = await pool.query(
    `SELECT host_id FROM tournaments WHERE id = $1`,
    [tournament_id]
  );
  return result.rows[0]?.host_id;
};

module.exports = {
  getMatch,
  getMatchById,
  updateMatch,
  getNextMatch,
  assignPlayerToMatch,
  getHostID
};
