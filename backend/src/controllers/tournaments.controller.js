const tournamentModel = require("../models/tournament.model");
const pool = require("../config/db");

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
  const { tournament_id } = req.body;

  const players = await tournamentModel.getSeededPlayers(tournament_id);
  //console.log(players);
  if (players.length < 2) {
    return res
      .status(400)
      .json({ error: "Need at least 2 seeded players to start" });
  }
  if (players.some((p) => p.seed === null)) {
    return res
      .status(400)
      .json({ error: "All players must have a seed before starting" });
  }

  await tournamentModel.createBracket(tournament_id);

  await pool.query(
    `UPDATE tournaments SET status = 'in_progress' WHERE id = $1`,
    [tournament_id],
  );

  res.json({ message: "Bracket created, tournament started" });
};

const setSeed = async (req, res) => {
  const { tournament_id, user_id, seed } = req.body;

  const tournament = await tournamentModel.getTournament(tournament_id);
  if (!tournament) {
    return res.status(404).json({ error: "Tournament not found" });
  }
  if (tournament.status !== "open") {
    return res
      .status(400)
      .json({ error: "Cannot change seeds after tournament has started" });
  }

  try {
    const updated = await tournamentModel.setSeed({
      tournament_id: tournament_id,
      userId: user_id,
      seed,
    });
    if (!updated) {
      return res
        .status(404)
        .json({ error: "Player not found in this tournament" });
    }
    res.json(updated);
  } catch (err) {
    // Catches the duplicate seed error thrown in the model
    res.status(400).json({ error: err.message });
  }
};

const fillSeeds = async (req, res) => {
  const { tournament_id } = req.body;
  const tournament = await tournamentModel.getTournament(tournament_id);
  if (!tournament) {
    return res.status(404).json({ error: "Tournament not found" });
  }
  if (tournament.status !== "open") {
    return res
      .status(400)
      .json({ error: "Cannot change seeds after tournament has started" });
  }
  const result = await tournamentModel.fillRemainingSeeds(tournament_id);
  res.json(result);
  //maybe need error handeling?
};

const getPublicTournaments = async (req, res) => {
  const tournaments = await tournamentModel.getPublicTournaments();
  res.json(tournaments);
};

const getBrackets = async (req, res) => {
  const { id } = req.body;
  const tournament = await tournamentModel.getTournament(id);
  if (!tournament) {
    return res.status(404).json({ error: "Tournament not found" });
  }
  if (tournament.status === "open") {
    return res.status(400).json({ error: "Bracket not generated yet" });
  }

  const bracket = await tournamentModel.getBracket(id);
  res.json(bracket);
};

module.exports = {
  handleMatchResults,
  getTournament,
  createTournament,
  getPublicTournaments,
  joinTournament,
  startTournament,
  setSeed,
  fillSeeds,
  getBrackets,
};

//need to add a set seed method for frontend
//make sure backend checks if all seeds are set before tournamet is started
//check on all other functions
