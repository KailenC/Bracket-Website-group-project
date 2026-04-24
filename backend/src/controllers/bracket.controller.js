const bracketModel = require("../models/bracket.model");
const pool = require("../config/db");

const enterResultsIndividual = async (req, res) => {
  const { tournament_id, round, player1Id, player2Id, score1, score2 } =
    req.body;

  const match = await bracketModel.getMatch({
    tournament_id,
    round,
    player1Id,
    player2Id,
  });

  const currScore1 = match.score1 + (score1 > score2 ? 1 : 0);
  const currScore2 = match.score2 + (score2 > score1 ? 1 : 0);

  const winnerId =
    currScore1 === 3 ? player1Id : currScore2 === 3 ? player2Id : null;

  const updatedMatch = await bracketModel.updateMatch({
    tournament_id,
    round,
    player1Id,
    player2Id,
    score1: currScore1,
    score2: currScore2,
    winnerId,
    status: winnerId !== null ? "complete" : "in_progress",
  });

  // Only advance if this game sealed the match
  if (winnerId !== null) {
    await advanceWinner({ tournament_id, completedMatch: updatedMatch });
  }

  res.json(updatedMatch);
};

const enterResultsSeries = async (req, res) => {
  const { tournament_id, round, player1Id, player2Id, score1, score2 } =
    req.body;

  const user_id = req.user.id;
  const hostID = await bracketModel.getHostID(tournament_id);

    if (hostID !== user_id) {
      return res
        .status(403)
        .json({ error: "Non-Host attempting to modify bracket" });
    }
  try {
    const winnerId = score1 > score2 ? player1Id : player2Id;

    const updatedMatch = await bracketModel.updateMatch({
      tournament_id,
      round,
      player1Id,
      player2Id,
      score1,
      score2,
      winnerId,
      status: "complete",
    });

    if (!updatedMatch) {
      return res.status(404).json({ error: "Match not found, previous rounds must be completed first" });
    }

    await advanceWinner({ tournament_id, completedMatch: updatedMatch });

    res.json(updatedMatch);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

const advanceWinner = async ({ tournament_id, completedMatch }) => {
  const { winner_id, round, match_number } = completedMatch;

  const nextMatch = await bracketModel.getNextMatch({
    tournament_id,
    currentRound: round,
    matchNumber: match_number,
  });

  // No next match means this was the final — tournament is over
  if (!nextMatch) {
    await pool.query(
      `UPDATE tournaments SET status = 'complete' WHERE id = $1`,
      [tournament_id],
    );
    return null;
  }

  // Odd match number → player1 slot, even → player2 slot
  const slot = match_number % 2 !== 0 ? 1 : 2;

  const advanced = await bracketModel.assignPlayerToMatch({
    matchId: nextMatch.id,
    playerId: winner_id,
    slot,
  });

  return advanced;
};

module.exports = { enterResultsIndividual, enterResultsSeries };
