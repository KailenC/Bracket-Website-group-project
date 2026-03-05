const tournamentModel = require("../models/tournament.model");

const handleMatchResults = (req, res) => {
  const { tournament, game, player1, player2 } = req.body;

  res.json({ tournament, game, player1, player2 });
};

const getTournamentVIEWONLY = (req, res) => {
  const { tournament } = req.body;
  // send tournament info to frontend
};

module.exports = { handleMatchResults, getTournamentVIEWONLY };
