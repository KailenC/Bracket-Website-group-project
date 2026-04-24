const tournamentModel = require("../models/tournament.model");
const pool = require("../config/db");

const getTournament = async (req, res) => {
  const { id } = req.params;

  try {
    const tournament = await tournamentModel.getTournament(id);

    if (!tournament) {
      return res.status(404).json({ message: "Tournament not found" });
    }

    res.json(tournament);
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
};

const createTournament = async (req, res) => {
  const { tournament_name, tournament_type, max_players } = req.body;
  const host_id = req.user.id;

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
  const { tournament_id } = req.body;
  const user_id = req.user.id;

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

  const tournament = await tournamentModel.getTournament(tournament_id);
  if (tournament.host_id !== req.user.id) {
    return res
      .status(403)
      .json({ error: "Only the host can start tournament" });
  }

  const players = await tournamentModel.getSeededPlayers(tournament_id);
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
  const { tournament_id, player_id, seed } = req.body;
  const user_id = req.user.id;

  const tournament = await tournamentModel.getTournament(tournament_id);
  if (!tournament) {
    return res.status(404).json({ error: "Tournament not found" });
  }

  if (tournament.host_id !== user_id) {
    return res.status(403).json({ error: "Only the host can set seeds" });
  }

  if (tournament.status !== "open") {
    return res
      .status(400)
      .json({ error: "Cannot change seeds after tournament has started" });
  }

    if (!player_id || seed == null|| seed < 1 || seed > tournament.max_players) {
    return res.status(400).json({ error: "player_id and seed are required or are out of bounds" });
  }

  try {
    const updated = await tournamentModel.setSeed({
      tournament_id: tournament_id,
      userId: player_id,
      seed: seed,
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

const getMyTournaments = async (req, res) => {
  const user_id = req.user.id;

  const tournaments = await tournamentModel.getTournamentByUserID(user_id);
  res.json(tournaments);
};

const getBrackets = async (req, res) => {
  const { id } = req.params;
  try {
    const tournament = await tournamentModel.getTournament(id);
    if (!tournament) {
      return res.status(404).json({ error: "Tournament not found" });
    }
    if (tournament.status === "open") {
      return res.status(400).json({ error: "Bracket not generated yet" });
    }
    const bracket = await tournamentModel.getBracket(id);
    res.json(bracket);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

const setSeedBulk = async (req, res) => {
  const { tournament_id, seeds } = req.body;
  const user_id = req.user.id;

  if (!Array.isArray(seeds) || seeds.length === 0) {
    return res.status(400).json({ error: "Seeds array is required" });
  }

  const tournament = await tournamentModel.getTournament(tournament_id);
  if (!tournament) {
    return res.status(404).json({ error: "Tournament not found" });
  }

  // Host check
  if (tournament.host_id !== user_id) {
    return res.status(403).json({ error: "Only the host can set seeds" });
  }

  if (tournament.status !== "open") {
    return res.status(400).json({
      error: "Cannot change seeds after tournament has started",
    });
  }

  const seenSeeds = new Set();

  for (const entry of seeds) {
    const { player_id, seed } = entry;

    if (!player_id || seed == null) {
      return res.status(400).json({ error: "Invalid seed entry" });
    }

    if (seed < 1 || seed > tournament.max_players) {
      return res.status(400).json({
        error: `Seed ${seed} is out of bounds`,
      });
    }

    if (seenSeeds.has(seed)) {
      return res.status(400).json({
        error: `Duplicate seed detected: ${seed}`,
      });
    }

    seenSeeds.add(seed);
  }

  try {
    const result = await tournamentModel.setSeedsBulk(
      tournament_id,
      seeds
    );

    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const getPlayers = async (req, res) => {
  const { id } = req.params;
  try {
    const players = await tournamentModel.getPlayers(id);
    res.json(players);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getTournament,
  createTournament,
  getPublicTournaments,
  getMyTournaments,
  joinTournament,
  startTournament,
  setSeed,
  fillSeeds,
  getBrackets,
  setSeedBulk,
  getPlayers
};

//need to add a set seed method for frontend
//make sure backend checks if all seeds are set before tournamet is started
//check on all other functions
