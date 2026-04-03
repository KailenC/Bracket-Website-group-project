const tournamentModel = require("../models/tournament.model");

const handleMatchResults = (req, res) => {
  const { tournament, game, player1, player2 } = req.body;

  res.json({ tournament, game, player1, player2 });
}; //not sure what this does 

const getTournament = (req, res) => {
  const id = req.params.id;
  // need to hit database for details
  // send tournament info to frontend
};

const createTournament = async (req, res) => {
  const { tournament_name, host_id, tournament_type, max_players } = req.body;

  try {
    const newTournament = await tournamentModel.createTournament({
      tournament_name,
      host_id,
      tournament_type,
      max_players,
    });
    res
      .status(201)
      .json({ message: "tournament created", tournament: newTournament });
  } catch (err) {
    console.error("Error creating tournament:", err);

    res.status(500).json({ message: "Failed to create tournament" });
  }
};

const getPublicTournaments = (req, res) => {
  // send all public tournaments to frontend
  // need database method
};

const joinTournament = async (req, res) => {
  const { tournament_id, user_id } = req.body;

  try {
    await tournamentModel.joinTournament({
      tournament_id,
      user_id,
    });
    res.status(201).json({ message: "Joined Succesfully" });
  } catch (err) {
    console.error("Error", err);

    res.status(500).json({ message: "Failed to Join" });
  }
  // check to make sure tournament isnt full, and user has permision
  // need database method
  // send back good or bad
  // update users profile
};

const startTournament = async (req, res) => {
  const { tournamentId } = req.body;

  const players = await tournamentModel.getSeededPlayers(tournamentId);
  if (players.length < 2) {
    return res.status(400).json({ error: "Need at least 2 seeded players to start" });
  }
  if (players.some(p => p.seed === null)) {
    return res.status(400).json({ error: "All players must have a seed before starting" });
  }

  await tournamentModel.createBracket(tournamentId);

  await pool.query(
    `UPDATE tournaments SET status = 'in_progress' WHERE id = $1`,
    [tournamentId]
  );

  res.json({ message: "Bracket created, tournament started" });
};

module.exports = {
  handleMatchResults,
  getTournament,
  createTournament,
  getPublicTournaments,
  joinTournament,
  startTournament
};

//need to add a set seed method for frontend
//make sure backend checks if all seeds are set before tournamet is started

