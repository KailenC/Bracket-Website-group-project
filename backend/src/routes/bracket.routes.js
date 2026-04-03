const express = require("express");
const router = express.Router();

const bracketController = require("../controllers/bracket.controller");

router.post("/enterResultsIndividual", bracketController.enterResultsIndividual);
router.post("/enterResultsSeries", bracketController.enterResultsSeries);

module.exports = router;
