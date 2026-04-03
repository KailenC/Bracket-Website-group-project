const pool = require("../config/db");

const getTournament = async (tourament_id) => {
  const result = await pool.query(
    `SELECT * FROM tournaments WHERE id = $1`[tourament_id],
  );
};

const updateTournament = async (tournamentData) => {};

const createTournament = async (tournamentData) => {
  const { tournament_name, host_id, tournament_type, max_players } =
    tournamentData;

  // default status
  const status = "open";

  const result = await pool.query(
    `INSERT INTO tournaments (name, host_id, status, type, max_players)
            VALUES($1, $2, $3, $4, $5) RETURNING id, name, host_id, status, type, max_players`,
    [tournament_name, host_id, status, tournament_type, max_players],
  );

  return result.rows[0];
};

const joinTournament = async (tournamentData) => {
  const { tournament_id, user_id } = tournamentData;

  const result = await pool.query(
    `INSERT INTO tournament_players (tournament_id, user_id)
            VALUES($1, $2) RETURNING tournament_id, user_id`,
    [tournament_id, user_id],
  );

  return result.rows[0];
};

module.exports = {
  getTournament,
  updateTournament,
  createTournament,
  joinTournament,
};
