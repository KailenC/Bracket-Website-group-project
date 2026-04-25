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

// UPDATED — also returns username by joining with users table
const getSeededPlayers = async (tournament_id) => {
  const result = await pool.query(
    `SELECT tp.user_id, tp.seed, u.username
     FROM tournament_players tp
     JOIN users u ON tp.user_id = u.id
     WHERE tp.tournament_id = $1
     ORDER BY tp.seed ASC`,
    [tournament_id],
  );
  return result.rows;
};

const createBracket = async (tournament_id) => {
  const players = await getSeededPlayers(tournament_id);
  const playerCount = players.length;

  const bracketSize = Math.pow(2, Math.ceil(Math.log2(playerCount)));
  const totalRounds = Math.log2(bracketSize);

  // Build seed → userId map (seed is 1-based)
  const seedMap = {};
  for (const p of players) {
    seedMap[p.seed] = p.user_id;
  }

  // Standard bracket position algorithm:
  // Recursively splits seeds so 1 and 2 are always in opposite halves,
  // 3 and 4 are separated, etc.
  function buildPositions(size) {
    if (size === 2) return [1, 2];
    const prev = buildPositions(size / 2);
    const result = [];
    for (const pos of prev) {
      result.push(pos);
      result.push(size + 1 - pos); // mirror opponent
    }
    return result;
  }

  // e.g. for size 8: [1, 8, 4, 5, 2, 7, 3, 6]
  // pairs become: 1v8, 4v5, 2v7, 3v6 — seeds 1 and 2 in opposite halves
  const positions = buildPositions(bracketSize);
  const slots = positions.map((seed) => seedMap[seed] ?? null);

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const round1Matches = [];
    for (let i = 0; i < bracketSize / 2; i++) {
      const player1Id = slots[i * 2];
      const player2Id = slots[i * 2 + 1];
      const matchNumber = i + 1;

      let status;
      if (!player1Id && !player2Id) {
        status = "bye";
      } else if (!player1Id || !player2Id) {
        status = "bye";
      } else {
        status = "pending";
      }

      const result = await client.query(
        `INSERT INTO matches 
           (tournament_id, round, match_number, player1_id, player2_id, status)
         VALUES ($1, 1, $2, $3, $4, $5)
         RETURNING *`,
        [tournament_id, matchNumber, player1Id, player2Id, status],
      );
      round1Matches.push(result.rows[0]);
    }

    // Round 2+ shells
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

    // Auto-advance byes
    for (const match of round1Matches) {
      if (match.status === "bye") {
        const winnerId = match.player1_id ?? match.player2_id;
        if (!winnerId) continue;
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
       m.player1_id, p1.username AS player1_username, tp1.seed AS player1_seed,
       m.player2_id, p2.username AS player2_username, tp2.seed AS player2_seed,
       m.winner_id, w.username AS winner_username
     FROM matches m
     LEFT JOIN users p1 ON m.player1_id = p1.id
     LEFT JOIN users p2 ON m.player2_id = p2.id
     LEFT JOIN users w  ON m.winner_id  = w.id
     LEFT JOIN tournament_players tp1 ON m.player1_id = tp1.user_id AND tp1.tournament_id = m.tournament_id
     LEFT JOIN tournament_players tp2 ON m.player2_id = tp2.user_id AND tp2.tournament_id = m.tournament_id
     WHERE m.tournament_id = $1
     ORDER BY m.round ASC, m.match_number ASC`,
    [tournament_id],
  );
  return result.rows;
};
const setSeedsBulk = async (tournament_id, seeds) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    for (const { player_id, seed } of seeds) {
      const res = await client.query(
        `
        UPDATE tournament_players
        SET seed = $1
        WHERE tournament_id = $2 AND user_id = $3
        RETURNING *
        `,
        [seed, tournament_id, player_id]
      );

      if (res.rowCount === 0) {
        throw new Error(`Player ${player_id} not in tournament`);
      }
    }

    await client.query("COMMIT");
    return { success: true };

  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};

const getPlayers = async (tournament_id) => {
  const result = await pool.query(
    `SELECT u.id, u.username, tp.seed
     FROM tournament_players tp
     JOIN users u ON u.id = tp.user_id
     WHERE tp.tournament_id = $1
     ORDER BY tp.seed ASC NULLS LAST`,
    [tournament_id]
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
  setSeedsBulk,
  getPlayers
};
