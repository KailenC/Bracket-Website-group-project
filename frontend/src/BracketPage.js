import { useState, useEffect} from "react";
//useParams, to read the :id from the URL 
import { useParams, useNavigate, Link } from "react-router-dom";


// this function is for matches

function groupMatchesByRound(matches)
{
    const roundMap ={};

    matches.forEach(match => 
    {
        const round = match.round;
        if(!roundMap[round]) roundMap[round] = [];
        roundMap[round].push({
            id : match.id,
            //will get the player1 name from the backend
            teamA: match.player1_username || "TBD",
            //real id from the player1
            teamAId: match.player1_id,
            teamB: match.player2_username || "TBD",
            teamBId: match.player2_id,
            //if the winnser is decided it will be updated
            winner: match.winner_username || null,
            //such as pending, complete
            status: match.status






        });

        
    });
    //sorting by round number
    return Object.keys(roundMap)
    .sort((a,b) => Number(a)-Number(b))
    .map(round => roundMap[round]);

}

// setting the round's name like semi final, quareter final
function getRoundName(roundIndex, totalRounds)
{
    const roundName = totalRounds - 1 - roundIndex;
    if (roundName == 0) return "Final";
    if (roundName == 1) return "SemiFinal";
    if(roundName == 2 ) return "QuarterFinal";

    return `Round ${roundIndex + 1}`;

}

function MatchBox({ match, onPick }) {
  // if the winner is decided, the mathc will be completed
  
  const isComplete = match.status === "complete";
 
  return (
    <div style={{
      background: "#fff",
      border: "1px solid #e5e7eb",
      borderRadius: 10,
      overflow: "hidden",
      width: 160,
      boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
      flexShrink: 0,
    }}>
 
      {/* Team A — top row */}
      <div
        onClick={() => {
          // only allow clicking if:
          //match is not already complete (real result)
          //.  team is not "TBD" (waiting for previous round)
        // team is not "BYE"
          if (!isComplete && match.teamA !== "TBD" && match.teamA !== "BYE") {
            onPick(match.id, match.teamA);
          }
        }}
        style={{
          padding: "10px 12px",
          fontSize: 13,
          // purple background and white text if this team is the winner
          fontWeight: match.winner === match.teamA ? 700 : 400,
          color:      match.winner === match.teamA ? "#fff" : "#1f2937",
          background: match.winner === match.teamA ? "#4a429f" : "#fff",
          // show pointer cursor only if team is clickable
          cursor: isComplete || match.teamA === "TBD" ? "default" : "pointer",
          borderBottom: "1px solid #e5e7eb",
          transition: "background 0.15s",
        }}
        onMouseEnter={e => {
          if (!isComplete && match.teamA !== "TBD" && !match.winner) {
            e.currentTarget.style.background = "#f3f4f6";
          }
        }}
        onMouseLeave={e => {
          if (match.winner !== match.teamA) {
            e.currentTarget.style.background = "#fff";
          }
        }}
      >
        {match.teamA}
      </div>
 
      {/* Team B — bottom row */}
      <div
        onClick={() => {
          if (!isComplete && match.teamB !== "TBD" && match.teamB !== "BYE") {
            onPick(match.id, match.teamB);
          }
        }}
        style={{
          padding: "10px 12px",
          fontSize: 13,
          fontWeight: match.winner === match.teamB ? 700 : 400,
          color:      match.winner === match.teamB ? "#fff" : "#1f2937",
          background: match.winner === match.teamB ? "#4a429f" : "#fff",
          cursor: isComplete || match.teamB === "TBD" || match.teamB === "BYE" ? "default" : "pointer",
          transition: "background 0.15s",
          color: match.teamB === "BYE" ? "#9ca3af" : match.winner === match.teamB ? "#fff" : "#1f2937",
        }}
        onMouseEnter={e => {
          if (!isComplete && match.teamB !== "TBD" && match.teamB !== "BYE" && !match.winner) {
            e.currentTarget.style.background = "#f3f4f6";
          }
        }}
        onMouseLeave={e => {
          if (match.winner !== match.teamB) {
            e.currentTarget.style.background = "#fff";
          }
        }}
      >
        {match.teamB}
      </div>
    </div>
  );
}
 
// main bracket
export default function BracketPage() {
  const { id }   = useParams();    // tournament id from URL
  const navigate = useNavigate();
 
  //state variables 
  const [tournament, setTournament] = useState(null);  // tournament info
  const [rounds,     setRounds]     = useState([]);    // array of rounds → each is array of matches
  const [players,    setPlayers]    = useState([]);    // list of players in tournament
  const [loading,    setLoading]    = useState(true);  // show loading while fetching
  const [saving,     setSaving]     = useState(false); // show loading while saving
  const [saved,      setSaved]      = useState(false); // show "saved!" message
  const [error,      setError]      = useState("");    // show error message
 
  
  // useEffect runs this code ONCE when the page first loads
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { navigate("/login"); return; }
 
    // call  GET /tournaments/:id
    // so that backend could now return tournament, matches, players 
    fetch(`http://localhost:8080/tournaments/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => { if (!r.ok) throw new Error(); return r.json(); })
      .then(data => {
        // save the tournament info (name, sport, status etc)
        setTournament(data.tournament);
 
        // save the players list
        setPlayers(data.players || []);
 
        // if matches exist, we can group them by round and show the bracket
        if (data.matches && data.matches.length > 0) {
          const grouped = groupMatchesByRound(data.matches);
          setRounds(grouped);
        }
      })
      .catch(() => {
        setError("Could not load tournament. Make sure the backend is running.");
      })
      .finally(() => setLoading(false));
 
  }, [id, navigate]);
 
  //updating the winnder (for the user)
  const handlePick = (matchId, winner) => {
    setRounds(prevRounds =>
      prevRounds.map(round =>
        round.map(match =>
          // find the match and set winner ,leaving all other matches unchanged
          match.id === matchId ? { ...match, winner } : match
        )
      )
    );
  };
//save options for user to the backend 
  const handleSave = async () => 
    {
    const token = localStorage.getItem("token");
    setSaving(true);
    setError("");
 
    let allSaved = true;
 
    for (let roundIndex = 0; roundIndex < rounds.length; roundIndex++) {
      const round = rounds[roundIndex];
 
      for (const match of round) {
        // only save matches that have a winner picked
        if (!match.winner) continue;
        // skip TBD matches, validating 
        if (!match.teamAId || !match.teamBId) continue;
 
        try {
          const res = await fetch("http://localhost:8080/brackets/enterResultsSeries", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              tournament_id: id,
              round: roundIndex + 1,           
              player1Id: match.teamAId,         // getting real user ID
              player2Id: match.teamBId,  

              score1: match.winner === match.teamA ? 1 : 0, //checking the score between two teamas
              score2: match.winner === match.teamB ? 1 : 0,
            }),
          });
 
          //error handling for not being able to save the match
          if (!res.ok) {
            allSaved = false;
            console.error("Failed to save match", match.id);
          }
        } catch (err) {
          allSaved = false;
          console.error("Error saving match", err);
        }
      }
    }
 
    setSaving(false);
 
    //if the matches are 'TBD' , it cannot be saved and will show this error
    if (allSaved) {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } else {
      setError("Some picks could not be saved. Try again.");
    }
  };
 
 
// rounds.length - 1 = the last index = the Final round
  const lastRound = rounds[rounds.length - 1];
  // lastRound[0] is the final match
  // .winner is whoever won from the last round
  // so if the last round exists, the winner will be decided, if not it will be null
    const champion = lastRound ? lastRound[0].winner : null;
 
  // how many picks has the user made so far
  const totalPicks = rounds.flatMap(r => r).filter(m => m.winner).length;
 
  //loading
  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", fontFamily: "'Poppins', sans-serif", color: "#9ca3af" }}>
      Loading tournament…
    </div>
  );
 
  // page 
    <div style={{ minHeight: "100vh", background: "#f9fafb", fontFamily: "'Poppins', sans-serif" }}>
 
      {/* NAVBAR */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "aliceblue", padding: "16px 20px", borderBottom: "1px solid #e5e7eb", position: "sticky", top: 0, zIndex: 100 }}>
        <Link to="/" style={{ fontWeight: 700, fontSize: 16, color: "#1f2937", textDecoration: "none" }}>
          🏆 BracketMaker
        </Link>
        <Link to="/dashboard" className="btn" style={{ padding: "8px 16px", borderRadius: 5, fontSize: 13, textDecoration: "none" }}>
          ← Dashboard
        </Link>
      </div>
 
      <main style={{ maxWidth: 1100, margin: "0 auto", padding: "28px 20px" }}>
 
        {/* ERROR MESSAGE */}
        {error && (
          <div style={{ background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: 8, padding: "12px 16px", marginBottom: 20, color: "#dc2626", fontSize: 13 }}>
            {error}
          </div>
        )}
 
        {/* TOURNAMENT HEADER */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
          <div>
            <p style={{ margin: 0, fontSize: 11, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "1px" }}>
              {tournament?.type || tournament?.sport}
            </p>
            <h1 style={{ margin: "4px 0 0", fontSize: 28, fontWeight: 900, color: "#1f2937" }}>
              {tournament?.name}
            </h1>
            <p style={{ margin: "4px 0 0", fontSize: 12, color: "#9ca3af" }}>
              {players.length} players · {totalPicks} picks made
            </p>
          </div>
 
          {/* SAVE BUTTON — only show if there are picks to save */}
          {totalPicks > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              {saved && <p style={{ margin: 0, fontSize: 12, color: "#16a34a", fontWeight: 600 }}>✓ Picks saved!</p>}
              <button
                style={{ ...S.primary, opacity: saving ? 0.6 : 1 }}
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? "Saving…" : "Save Picks"}
              </button>
            </div>
          )}
        </div>
 
        {/* CHAMPION BANNER — shows when someone has won the whole bracket */}
        {champion && (
          <div style={{ background: "#4a429f", color: "#fff", borderRadius: 12, padding: "16px 24px", marginBottom: 24, textAlign: "center" }}>
            <p style={{ margin: 0, fontSize: 11, opacity: 0.8, textTransform: "uppercase", letterSpacing: "1px" }}>Champion</p>
            <p style={{ margin: "4px 0 0", fontSize: 26, fontWeight: 900 }}>🏆 {champion}</p>
          </div>
        )}
 
        {/* TOURNAMENT NOT STARTED YET */}
        {/* Shows when tournament is still "open" — no bracket generated yet */}
        {tournament?.status === "open" && (
          <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: "32px", textAlign: "center", color: "#6b7280" }}>
            <p style={{ fontSize: 40, margin: 0 }}>⏳</p>
            <p style={{ fontSize: 16, fontWeight: 700, color: "#1f2937", margin: "12px 0 4px" }}>
              Tournament not started yet
            </p>
            <p style={{ fontSize: 13, margin: 0 }}>
              {players.length} player{players.length !== 1 ? "s" : ""} joined so far.
              The host needs to start the tournament to generate the bracket.
            </p>
            {/* list of players who joined */}
            {players.length > 0 && (
              <div style={{ marginTop: 20, display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center" }}>
                {players.map((p, i) => (
                  <span key={i} style={{ background: "#f3f4f6", color: "#374151", padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 600 }}>
                    #{p.seed || i + 1} {p.username || p.user_id}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
 
        {/* BRACKET TREE */}
        {/* Shows when tournament has started and matches exist */}
        {rounds.length > 0 && (
          <div>
            <p style={{ margin: "0 0 8px", fontSize: 12, color: "#9ca3af" }}>
              Click a player name to pick them as the winner
            </p>
 
            {/* rounds displayed side by side, scrollable if too wide */}
            <div style={{ display: "flex", gap: 32, overflowX: "auto", paddingBottom: 20, alignItems: "flex-start" }}>
 
              {rounds.map((round, roundIndex) => (
                <div key={roundIndex} style={{ display: "flex", flexDirection: "column", flexShrink: 0 }}>
 
                  {/* round label e.g. "Round 1", "Semifinal", "Final" */}
                  <p style={{ fontSize: 10, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "1px", margin: "0 0 12px" }}>
                    {getRoundName(roundIndex, rounds.length)}
                  </p>
 
                  {/* matches in this round — spaced further apart in later rounds */}
                  <div style={{
                    display: "flex",
                    flexDirection: "column",
                    // gap gets bigger each round to align with bracket tree visually
                    gap: Math.pow(2, roundIndex) * 16 + 8,
                  }}>
                    {round.map(match => (
                      <MatchBox
                        key={match.id}
                        match={match}
                        onPick={handlePick}
                      />
                    ))}
                  </div>
                </div>
              ))}
 
              {/* WINNER COLUMN — shows at the very end when champion decided */}
              {champion && (
                <div style={{ flexShrink: 0 }}>
                  <p style={{ fontSize: 10, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "1px", margin: "0 0 12px" }}>
                    Winner
                  </p>
                  <div style={{ background: "#4a429f", color: "#fff", borderRadius: 10, padding: "10px 16px", width: 160, textAlign: "center", fontWeight: 700, fontSize: 14 }}>
                    🏆 {champion}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
 
      </main>
    </div>
  ;
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
};
 
