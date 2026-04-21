const express = require("express");
const router = express.Router();
const authenticateToken = require("../middleware/auth.middleware");
const bracketController = require("../controllers/bracket.controller");

router.post(
  "/enterResultsIndividual",
  bracketController.enterResultsIndividual,
);
router.post("/enterResultsSeries", authenticateToken, bracketController.enterResultsSeries);
router.get("/test", (req, res) => {
  res.send("bracket route works");
});
module.exports = router;
