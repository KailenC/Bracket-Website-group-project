const pool = require("../config/db");

const getTournament = async (tournament_id) => {
  const result = await pool.query(`SELECT * FROM tournaments WHERE id = $1`, [
    tournament_id,
  ]);
  return result.rows[0];
};

const getTournamentByUserID = async (user_id) => {
  const result = await pool.query(
    `SELECT DISTINCT t.* 
    FROM tournaments t 
    LEFT JOIN tournament_players tp ON t.id = tp.tournament_id 
    WHERE t.host_id = $1 OR tp.user_id = $1 
    ORDER BY t.created_at DESC`,
    [user_id],
  );
  return result.rows;
};

const updateTournament = async (tournamentData) => {};

const createTournament = async (tournamentData) => {
  const { tournament_name, host_id, tournament_type, max_players } =
    tournamentData;

  // default status
  const status = "open";

  const result = await pool.query(
    `INSERT INTO tournaments (name, host_id, status, type, max_players)
            VALUES($1, $2, $3, $4, $5) RETURNING id, name, host_id, status, type, max_players`,
    [tournament_name, host_id, status, tournament_type, max_players],
  );

  return result.rows[0];
};

const joinTournament = async (tournamentData) => {
  const { tournament_id, user_id } = tournamentData;

  const result = await pool.query(
    `INSERT INTO tournament_players (tournament_id, user_id)
            VALUES($1, $2) RETURNING tournament_id, user_id`,
    [tournament_id, user_id],
  );

  return result.rows[0];
};

const getSeededPlayers = async (tournament_id) => {
  //console.log("tournament_id: ", tournament_id);

  const result = await pool.query(
    `SELECT user_id, seed FROM tournament_players
     WHERE tournament_id = $1
     ORDER BY seed ASC`,
    [tournament_id],
  );

  //console.log("DB result: ", result.rows);
  return result.rows;
};

const createBracket = async (tournament_id) => {
  //creates bracket in DB manually and upfront once all players are entered and seeded
  const players = await getSeededPlayers(tournament_id);
  const playerCount = players.length;

  const bracketSize = Math.pow(2, Math.ceil(Math.log2(playerCount))); //I can explain this but its basically rounding up to always be <= 2^(number of rounds), think of how many starter slots are open
  const totalRounds = Math.log2(bracketSize); //clean number of rounds

  //empty slots are null if not filled with players
  const slots = [...players.map((p) => p.user_id)];
  while (slots.length < bracketSize) slots.push(null);

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const round1Matches = [];
    for (let i = 0; i < bracketSize / 2; i++) {
      const player1Id = slots[i]; // e.g. seed 1, 2, 3, 4
      const player2Id = slots[bracketSize - 1 - i]; // e.g. seed 8, 7, 6, 5
      const matchNumber = i + 1;

      const result = await client.query(
        `INSERT INTO matches 
           (tournament_id, round, match_number, player1_id, player2_id, status)
         VALUES ($1, 1, $2, $3, $4, $5)
         RETURNING *`,
        [
          tournament_id,
          matchNumber,
          player1Id,
          player2Id,
          player1Id && player2Id
            ? "pending" // normal match
            : player1Id
              ? "bye" // player1 gets a bye
              : "bye", // empty slot
        ],
      );
      round1Matches.push(result.rows[0]);
    }

    // --- ROUND 2+: empty shells for every subsequent round ---
    for (let round = 2; round <= totalRounds; round++) {
      const matchesInRound = bracketSize / Math.pow(2, round);
      for (let matchNumber = 1; matchNumber <= matchesInRound; matchNumber++) {
        await client.query(
          `INSERT INTO matches 
             (tournament_id, round, match_number, player1_id, player2_id, status)
           VALUES ($1, $2, $3, NULL, NULL, 'waiting')`,
          [tournament_id, round, matchNumber],
        );
      }
    }

    // Auto-advance any bye matches in round 1
    for (const match of round1Matches) {
      if (match.status === "bye") {
        const winnerId = match.player1_id;
        await client.query(
          `UPDATE matches SET winner_id = $1, status = 'complete' WHERE id = $2`,
          [winnerId, match.id],
        );
        await advanceBye({
          client,
          tournament_id,
          completedMatch: { ...match, winner_id: winnerId },
        });
      }
    }

    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};

// Only used during bracket creation to auto-advance bye slots into round 2
const advanceBye = async ({ client, tournament_id, completedMatch }) => {
  const { winner_id, match_number } = completedMatch;
  const nextMatchNumber = Math.ceil(match_number / 2);
  const slot = match_number % 2 !== 0 ? 1 : 2;
  const column = slot === 1 ? "player1_id" : "player2_id";

  await client.query(
    `UPDATE matches SET ${column} = $1
     WHERE tournament_id = $2 AND round = 2 AND match_number = $3`,
    [winner_id, tournament_id, nextMatchNumber],
  );
};

const setSeed = async ({ tournament_id, userId, seed }) => {
  // Check if seed is already taken by another player
  const taken = await pool.query(
    `SELECT user_id FROM tournament_players
     WHERE tournament_id = $1 AND seed = $2 AND user_id != $3`,
    [tournament_id, seed, userId],
  );
  if (taken.rows.length > 0) {
    throw new Error(`Seed ${seed} is already assigned to another player`);
  }

  const result = await pool.query(
    `UPDATE tournament_players SET seed = $1
     WHERE tournament_id = $2 AND user_id = $3
     RETURNING *`,
    [seed, tournament_id, userId],
  );
  return result.rows[0];
};

const fillRemainingSeeds = async (tournament_id) => {
  const players = await pool.query(
    `SELECT user_id, seed FROM tournament_players
     WHERE tournament_id = $1
     ORDER BY id ASC`, // id ASC preserves join order for fairness
    [tournament_id],
  );

  const unseeded = players.rows.filter((p) => p.seed === null);
  if (unseeded.length === 0) return { message: "All players already seeded" };

  const takenSeeds = players.rows
    .filter((p) => p.seed !== null)
    .map((p) => p.seed);

  // Walk up from 1 and collect the next available numbers
  const availableSeeds = [];
  let next = 1;
  while (availableSeeds.length < unseeded.length) {
    if (!takenSeeds.includes(next)) availableSeeds.push(next);
    next++;
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    for (let i = 0; i < unseeded.length; i++) {
      await client.query(
        `UPDATE tournament_players SET seed = $1
         WHERE tournament_id = $2 AND user_id = $3`,
        [availableSeeds[i], tournament_id, unseeded[i].user_id],
      );
    }
    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }

  return { message: `${unseeded.length} players assigned sequential seeds` };
};

const getPublicTournaments = async () => {
  const result = await pool.query(
    `SELECT t.id, t.name, t.status, t.type, t.max_players, t.created_at,
            COUNT(tp.user_id) AS current_players
     FROM tournaments t
     LEFT JOIN tournament_players tp ON t.id = tp.tournament_id
     WHERE t.status = 'open'
     GROUP BY t.id
     ORDER BY t.created_at DESC`,
  );
  return result.rows;
};

const getBracket = async (tournament_id) => {
  const result = await pool.query(
    `SELECT 
       m.id, m.round, m.match_number, m.status,
       m.score1, m.score2,
       m.player1_id, p1.username AS player1_username,
       m.player2_id, p2.username AS player2_username,
       m.winner_id, w.username AS winner_username
     FROM matches m
     LEFT JOIN users p1 ON m.player1_id = p1.id
     LEFT JOIN users p2 ON m.player2_id = p2.id
     LEFT JOIN users w  ON m.winner_id  = w.id
     WHERE m.tournament_id = $1
     ORDER BY m.round ASC, m.match_number ASC`,
    [tournament_id],
  );
  return result.rows;
};

module.exports = {
  getTournament,
  getTournamentByUserID,
  updateTournament,
  createTournament,
  joinTournament,
  createBracket,
  getSeededPlayers,
  setSeed,
  fillRemainingSeeds,
  getBracket,
  getPublicTournaments,
};
