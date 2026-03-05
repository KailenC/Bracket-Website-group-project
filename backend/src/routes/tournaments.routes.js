const express = require("express");
const router = express.Router();

const tournamentController = require("../controllers/tournaments.controller");

// when we have functions we can fix these
router.post("/handleScores", tournamentController.handleMatchResults);
router.get("/:id", tournamentController.getTournament);
router.post("/create", tournamentController.createTournament);
router.get("", tournamentController.getPublicTournaments);
router.get("/:id/join", tournamentController.joinTournament)

module.exports = router;
