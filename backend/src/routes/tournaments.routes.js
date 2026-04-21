const express = require("express");
const authenticateToken = require("../middleware/auth.middleware");
const router = express.Router();

const tournamentController = require("../controllers/tournaments.controller");

// non protected routes
router.get("/:id", tournamentController.getTournament); //works
router.get("/getBracket/:id", tournamentController.getBrackets); //works
router.get("", tournamentController.getPublicTournaments); ///works

// protected routes
router.post(
  "/create",
  authenticateToken,
  tournamentController.createTournament,
);
router.post("/join", authenticateToken, tournamentController.joinTournament);
router.post("/setSeed", authenticateToken, tournamentController.setSeed);
router.post("/fillSeeds", authenticateToken, tournamentController.fillSeeds); //should always be called before a tournament is started
router.post(
  "/startTournament",
  authenticateToken,
  tournamentController.startTournament,
);

module.exports = router;
