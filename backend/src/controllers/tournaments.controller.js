const tournamentModel = require("../models/tournament.model");

const handleMatchResults = (req, res) => {
  const { tournament, game, player1, player2 } = req.body;

  res.json({ tournament, game, player1, player2 });
};

const getTournament = (req, res) => {
  const id = req.params.id;
  // need to hit database for details
  // send tournament info to frontend
};

const createTournament = (req, res) => {
  // tournament params
  // make new tournament in database
  // update frontend
  // need database method
  
};

const getPublicTournaments = (req, res) => {
  // send all public tournaments to frontend
  // need database method
};

const joinTournament = (req, res) => {
  const id = req.params.id;
  // check to make sure tournament isnt full, and user has permision
  // need database method
  // send back good or bad
  // update users profile
};

module.exports = { handleMatchResults, getTournament, createTournament, getPublicTournaments, joinTournament };
