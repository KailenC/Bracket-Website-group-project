const express = require("express");
const router = express.Router();

const tournamentController = require("../controllers/tournaments.controller");

// when we have functions we can fix these
router.post("/handleScores", tournamentController.handleMatchResults);
router.get("/:id", tournamentController.getTournament);
router.post("/create", tournamentController.createTournament);
router.get("", tournamentController.getPublicTournaments);
router.post("/join", tournamentController.joinTournament);
router.post("/setSeed",tournamentController.setSeed);
router.post("/fillSeeds", tournamentController.fillSeeds); //should always be called before a tournament is started

module.exports = router;
