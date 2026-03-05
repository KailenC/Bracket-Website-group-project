const express = require("express");
const router = express.Router();

const tournamentController = require("../controllers/tournaments.controller");

// when we have functions we can fix these
router.post("/handleScores", tournamentController.handleMatchResults);
router.get("/get", tournamentController.getTournamentVIEWONLY);

module.exports = router;
