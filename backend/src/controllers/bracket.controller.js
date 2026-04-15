const bracketModel = require("../models/bracket.model");
const pool = require("../config/db");

const enterResultsIndividual = async (req, res) => {
  const { tournamentId, round, player1Id, player2Id, score1, score2 } =
    req.body;

  const match = await bracketModel.getMatch({
    tournamentId,
    round,
    player1Id,
    player2Id,
  });

  const currScore1 = match.score1 + (score1 > score2 ? 1 : 0);
  const currScore2 = match.score2 + (score2 > score1 ? 1 : 0);

  const winnerId =
    currScore1 === 3 ? player1Id : currScore2 === 3 ? player2Id : null;

  const updatedMatch = await bracketModel.updateMatch({
    tournamentId,
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
    await advanceWinner({ tournamentId, completedMatch: updatedMatch });
  }

  res.json(updatedMatch);
};

const enterResultsSeries = async (req, res) => {
  const { tournamentId, round, player1Id, player2Id, score1, score2 } =
    req.body;

  const winnerId = score1 > score2 ? player1Id : player2Id;

  const updatedMatch = await bracketModel.updateMatch({
    tournamentId,
    round,
    player1Id,
    player2Id,
    score1,
    score2,
    winnerId,
    status: "complete",
  });

  await advanceWinner({ tournamentId, completedMatch: updatedMatch });

  res.json(updatedMatch);
};

const advanceWinner = async ({ tournamentId, completedMatch }) => {
  const { winner_id, round, match_number } = completedMatch;

  const nextMatch = await bracketModel.getNextMatch({
    tournamentId,
    currentRound: round,
    matchNumber: match_number,
  });

  // No next match means this was the final — tournament is over
  if (!nextMatch) {
    await pool.query(
      `UPDATE tournaments SET status = 'complete' WHERE id = $1`,
      [tournamentId],
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
