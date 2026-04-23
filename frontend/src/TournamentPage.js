import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";

export default function TournamentPage() {
  const { id } = useParams();
  const [tournament, setTournament] = useState(null);
  const [bracket, setBracket] = useState([]);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [player1_score, setPlayer_1Score] = useState("");
  const [player2_score, setPlayer_2Score] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");

    fetch(`http://localhost:8080/tournaments/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then(setTournament);

    fetch(`http://localhost:8080/tournaments/getBracket/${id}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(async (r) => {
        const data = await r.json();

        if (!r.ok) {
          console.log("Bracket error:", data.error);
          return [];
        }

        return data;
      })
      .then((data) => setBracket(Array.isArray(data) ? data : []));
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

    alert("Succesfully Started Tournament");
    fetchBracket();
  };

  const handleSubmitScores = async () => {
    const token = localStorage.getItem("token");

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
    alert("Succesfully submitted scores");
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
      <h1>{tournament.name}</h1>

      {/*Bracket Logic */}
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
              <h2
                style={{
                  textAlign: "center",
                }}
              >
                Round {round}
              </h2>

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
                    {match.player1_username ?? "TBD"} vs {match.player2_username ?? "TBD"}
                  </div>
                  <div> {match.status}</div>
                </button>
              ))}
            </div>
          ))}
      </div>

      {/*Start tournament*/}
      {tournament?.status === "open" && (
        <button style={S.primary} onClick={startTournament}>
          Start Tournament
        </button>
      )}
      {tournament?.status !== "open" && <p>Tournament Started</p>}

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
              placeholder="Player 1 Score"
              value={player1_score}
              onChange={(e) => setPlayer_1Score(e.target.value)}
              className="text-entry"
            ></input>

            <input
              display="flex"
              style={{ width: "100%", padding: "10px", borderRadius: 6 }}
              type="number"
              placeholder="Player 2 Score"
              value={player2_score}
              onChange={(e) => setPlayer_2Score(e.target.value)}
              className="text-entry"
            ></input>

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

const S = {
  primary: {
    background: "#4a429f",
    color: "#fff",
    border: "none",
    padding: "9px 18px",
    borderRadius: 7,
    cursor: "pointer",
    fontWeight: 700,
    fontSize: 13,
    fontFamily: "'Poppins', sans-serif",
  },
  ghost: {
    background: "none",
    border: "1px solid #d1d5db",
    color: "#6b7280",
    padding: "8px 14px",
    borderRadius: 7,
    cursor: "pointer",
    fontSize: 13,
    fontFamily: "'Poppins', sans-serif",
  },
  input: {
    background: "#fff",
    border: "1px solid #d1d5db",
    color: "#1f2937",
    padding: "10px 12px",
    borderRadius: 7,
    fontSize: 13,
    outline: "none",
    width: "100%",
    fontFamily: "'Poppins', sans-serif",
  },
  label: {
    fontSize: 11,
    color: "#6b7280",
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
};
