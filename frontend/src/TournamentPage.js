import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";

export default function TournamentPage() {
  const { id } = useParams();
  const [tournament, setTournament] = useState(null);
  const [bracket, setBracket] = useState([]);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [player1_score, setPlayer_1Score] = useState("");
  const [player2_score, setPlayer_2Score] = useState("");
  const [players, setPlayers] = useState([]);
  const [editedSeeds, setEditedSeeds] = useState({});
  const [seedsCollapsed, setSeedsCollapsed] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");

    fetch(`http://localhost:8080/tournaments/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then(setTournament);

    fetch(`http://localhost:8080/tournaments/getBracket/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (r) => {
        const data = await r.json();
        if (!r.ok) return [];
        return data;
      })
      .then((data) => setBracket(Array.isArray(data) ? data : []));

    fetch(`http://localhost:8080/tournaments/${id}/players`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    fetch(`http://localhost:8080/tournaments/${id}/players`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => {
        console.log("Players status:", r.status);
        if (!r.ok) return [];
        return r.json();
      })
      .then((data) => {
        console.log("Players data:", data);
        if (!Array.isArray(data)) return;
        setPlayers(data);
        const seedMap = {};
        data.forEach((p) => {
          seedMap[p.id] = p.seed ?? "";
        });
        setEditedSeeds(seedMap);
      })
      .catch((err) => console.error("Players fetch failed:", err));
  }, [id]);

  const fetchBracket = async () => {
    const token = localStorage.getItem("token");
    const res = await fetch(
      `http://localhost:8080/tournaments/getBracket/${id}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    const data = await res.json();

    setBracket(Array.isArray(data) ? data : []);
  };

  const startTournament = async () => {
    const token = localStorage.getItem("token");
    // eslint-disable-next-line
    const fillRes = await fetch(`http://localhost:8080/tournaments/fillSeeds`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        tournament_id: id,
      }),
    });

    const res = await fetch(
      `http://localhost:8080/tournaments/startTournament`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          tournament_id: id,
        }),
      },
    );

    const data = await res.json();

    if (!res.ok) {
      alert(data.error || "Failed to start tournament");
      return;
    }

    setTournament((prev) => ({
      ...prev,
      status: "started",
    }));

    fetchBracket();
  };

  const handleSeedChange = (playerId, value) => {
    setEditedSeeds((prev) => ({
      ...prev,
      [playerId]: value,
    }));
  };

  const submitSeeds = async () => {
    const token = localStorage.getItem("token");

    const seeds = players
      .map((p) => {
        const seedValue = Number(editedSeeds[p.id]);

        if (!seedValue || Number.isNaN(seedValue)) return null;

        return {
          player_id: p.id,
          seed: seedValue,
        };
      })
      .filter(Boolean);

    console.log("SENDING SEEDS:", seeds);

    if (seeds.length === 0) {
      alert("No valid seeds entered");
      return;
    }

    const res = await fetch(`http://localhost:8080/tournaments/setSeedBulk`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        tournament_id: id,
        seeds,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      console.log(data);
      alert(data.error || "Failed to set seeds");
      return;
    }
  };

  //asdasdasd
  const handleSubmitScores = async () => {
    const token = localStorage.getItem("token");
  const score1 = Number(player1_score);
  const score2 = Number(player2_score);

  if (score1 < 0 || score2 < 0) {
    alert("Scores cannot be negative.");
    return;
  }

    const res = await fetch(
      `http://localhost:8080/brackets/enterResultsSeries`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          tournament_id: id,
          round: selectedMatch.round,
          player1Id: selectedMatch.player1_id,
          player2Id: selectedMatch.player2_id,
          score1: Number(player1_score),
          score2: Number(player2_score),
        }),
      },
    );

    const data = await res.json();

    if (!res.ok) {
      alert(data.error || "Failed to submit scores");
      return;
    }

    setSelectedMatch(null);
    fetchBracket();
  };

  if (!tournament) return <div>Loading...</div>;

  const grouped = {};
  if (Array.isArray(bracket)) {
    bracket.forEach((m) => {
      if (!grouped[m.round]) grouped[m.round] = [];
      grouped[m.round].push(m);
    });
  }

  return (
    <div>
      {/* Remove number input spinners globally for this page */}
      <style>{`
        input[type=number].no-spinner::-webkit-outer-spin-button,
        input[type=number].no-spinner::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        input[type=number].no-spinner {
          -moz-appearance: textfield;
        }
      `}</style>

      <div>
        <h1 style={{ marginLeft: 15, marginTop: 15 }}>{tournament.name}</h1>
      </div>

      {/* Bracket Logic */}
      <div
        style={{
          display: "flex",
          gap: 40,
          overflowX: "auto",
          padding: "10px 0",
          alignItems: "flex-start",
        }}
      >
        {Object.keys(grouped)
          .sort((a, b) => Number(a) - Number(b))
          .map((round) => (
            <div
              key={round}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 24 * Math.pow(Number(round), 2),
                minWidth: 200,
              }}
            >
              <h2 style={{ textAlign: "center" }}>Round {round}</h2>

              {grouped[round].map((match) => (
                <button
                  key={match.id}
                  className="match-tile"
                  onClick={() => {
                    setSelectedMatch(match);
                    setPlayer_1Score("");
                    setPlayer_2Score("");
                  }}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    border: "1px solid #e5e7eb",
                    borderRadius: 10,
                    padding: 10,
                    gap: 4,
                    background: "#fff",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                    textAlign: "center",
                  }}
                >
                    <div>
                      {match.player1_seed != null ? `(${match.player1_seed}) ` : ""}
                      {match.player1_username ?? "TBD"} vs{" "}
                      {match.player2_seed != null ? `(${match.player2_seed}) ` : ""}
                      {match.player2_username ?? "TBD"}
                    </div>
                  <div>
                    {match.score1} - {match.score2}
                  </div>
                  <div>{match.status}</div>
                </button>
              ))}
            </div>
          ))}
      </div>

      {/* Set Seeds */}
      {tournament?.status === "open" && (
        <div style={{ marginTop: 0, marginLeft: 15, display: "inline-block" }}>
          {/* Collapsible header */}
          <button
            onClick={() => setSeedsCollapsed((prev) => !prev)}
            style={{
              ...S.collapseToggle,
            }}
          >
            Set Seeds
          </button>

          {!seedsCollapsed && (
            <div style={S.seedBox}>
              <table
                style={{ borderCollapse: "collapse", width: "fit-content" }}
              >
                <thead>
                  <tr>
                    <th style={tableStyles.th}>Player</th>
                    <th style={tableStyles.th}>Seed</th>
                  </tr>
                </thead>

                <tbody>
                  {players.map((p) => (
                    <tr key={p.id}>
                      <td style={tableStyles.td}>{p.username}</td>
                      <td style={tableStyles.td}>
                        <input
                          type="number"
                          className="no-spinner"
                          value={editedSeeds[p.id] ?? ""}
                          onChange={(e) =>
                            handleSeedChange(p.id, e.target.valueAsNumber)
                          }
                          style={S.input}
                          min="1"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <button
                style={{ ...S.primary, marginTop: 12 }}
                onClick={submitSeeds}
              >
                Save Seeds
              </button>
            </div>
          )}
        </div>
      )}

      {/* Start tournament */}
      {tournament?.status === "open" && (
        <div style={{ marginTop: 10, marginLeft: 15 }}>
          <button style={S.primary} onClick={startTournament}>
            Start Tournament
          </button>
        </div>
      )}
      {tournament?.status !== "open" && <p>Tournament Started</p>}

      {/* Match score modal */}
      {selectedMatch && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 999,
          }}
          onClick={() => setSelectedMatch(null)}
        >
          <div
            style={{
              background: "#fff",
              padding: 30,
              borderRadius: 12,
              width: 320,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2>Match</h2>

            <p>
              {selectedMatch.player1_username ?? "TBD"} vs{" "}
              {selectedMatch.player2_username ?? "TBD"}
            </p>

            <input
              display="flex"
              style={{ width: "100%", padding: "10px", borderRadius: 6 }}
              type="number"
              placeholder={
                selectedMatch.score1 === null
                  ? "Player 1 Score"
                  : selectedMatch.player1_username + ": " + selectedMatch.score1
              }
              value={player1_score}
              onChange={(e) => setPlayer_1Score(e.target.value)}
              className="text-entry"
            />

            <input
              display="flex"
              style={{ width: "100%", padding: "10px", borderRadius: 6 }}
              type="number"
              placeholder={
                selectedMatch.score2 === null
                  ? "Player 2 Score"
                  : selectedMatch.player2_username + ": " + selectedMatch.score2
              }
              value={player2_score}
              onChange={(e) => setPlayer_2Score(e.target.value)}
              className="text-entry"
            />

            <p>{selectedMatch.status}</p>

            <button onClick={() => setSelectedMatch(null)}>Close</button>
            <button
              onClick={() => handleSubmitScores()}
              disabled={
                player1_score === "" ||
                player2_score === "" ||
                selectedMatch.status === "complete"
              }
            >
              Submit
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const tableStyles = {
  th: {
    textAlign: "left",
    borderBottom: "1px solid #000000",
    padding: "6px 12px 6px 6px",
    whiteSpace: "nowrap",
  },
  td: {
    padding: "6px 12px 6px 6px",
    borderBottom: "1px solid #000000",
    whiteSpace: "wrap",
  },
};

const S = {
  primary: {
    background: "#4a429f",
    color: "#fff",
    border: "none",
    padding: "9px 18px",
    borderRadius: 7,
    cursor: "pointer",
    fontWeight: 700,
    fontSize: 15,
    fontFamily: "'Poppins', sans-serif",
  },
  collapseToggle: {
    background: "#4a429f",
    color: "#fff",
    border: "none",
    padding: "9px 18px",
    borderRadius: 7,
    cursor: "pointer",
    fontWeight: 700,
    fontSize: 15,
    fontFamily: "'Poppins', sans-serif",
    marginBottom: 8,
    display: "block", // key: forces button onto its own line above the seedBox
  },
  seedBox: {
    border: "1px solid #000000",
    borderRadius: 10,
    padding: "16px 20px",
    background: "#fafafa",
    display: "inline-block",
  },

  input: {
    background: "#fff",
    border: "1px solid #d1d5db",
    color: "#000000",
    padding: "10px 12px",
    borderRadius: 5,
    fontSize: 13,
    outline: "none",
    width: "50px",
    fontFamily: "'Poppins', sans-serif",
  },
};
