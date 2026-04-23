import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";

export default function PublicTournaments() {
  const navigate = useNavigate();

  // stores all open tournaments from backend
  const [tournaments, setTournaments] = useState([]);

  // stores which tournament is currently being joined
  // null = not joining, 1 = joining tournament 1
  const [joining, setJoining] = useState(null);

  // success or error message to show user
  const [message, setMessage] = useState("");

  const [loading, setLoading] = useState(true);

  // loding the public tournaments here
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { navigate("/login"); return; }

    // GET /tournaments → returns all open tournaments
    fetch("http://localhost:8080/tournaments", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => { if (!r.ok) throw new Error(); return r.json(); })
      .then(data => setTournaments(data))
      .catch(() => setMessage("Could not load tournaments. Make sure backend is running."))
      .finally(() => setLoading(false));

  }, [navigate]);

  // joining the tournament
  const handleJoin = async (tournamentId) => {
    const token = localStorage.getItem("token");
    setJoining(tournamentId); // show loading on this specific button
    setMessage("");

    try {
      const res = await fetch("http://localhost:8080/tournaments/join", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        // send the tournament ID to backend
        // backend adds logged in user to tournament_players table
        body: JSON.stringify({ tournament_id: tournamentId }),
      });

      const data = await res.json();

      if (!res.ok) {
        // backend returns error e.g. "Tournament is full" or "Already joined"
        setMessage(data.message || data.error || "Could not join tournament.");
        return;
      }

      // show success message
      setMessage("Joined successfully! Go to your dashboard to see it.");

      // remove this tournament from the list so user can't join again
      setTournaments(prev => prev.filter(t => t.id !== tournamentId));

    } catch {
      setMessage("Something went wrong. Try again.");
    } finally {
      setJoining(null); // stop loading on button
    }
  };

// styling
  return (
    <div style={{ minHeight: "100vh", background: "#fff", fontFamily: "'Poppins', sans-serif" }}>

      {/* NAVBAR */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "aliceblue", padding: "16px 20px", borderBottom: "1px solid #e5e7eb", position: "sticky", top: 0, zIndex: 100 }}>
        <Link to="/" style={{ fontWeight: 700, fontSize: 16, color: "#1f2937", textDecoration: "none" }}>
          🏆 BracketMaker
        </Link>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <Link to="/dashboard" className="btn" style={{ padding: "8px 16px", borderRadius: 5, fontSize: 13, textDecoration: "none" }}>
            Dashboard
          </Link>
          <Link to="/profile" className="btn" style={{ padding: "8px 16px", borderRadius: 5, fontSize: 13, textDecoration: "none" }}>
            My Profile
          </Link>
        </div>
      </div>

      <main style={{ maxWidth: 700, margin: "0 auto", padding: "28px 20px" }}>

        {/* HEADER */}
        <div style={{ marginBottom: 24 }}>
          <p style={{ margin: 0, fontSize: 11, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "1px" }}>
            Browse
          </p>
          <h1 style={{ margin: "4px 0 0", fontSize: 28, fontWeight: 900, color: "#1f2937" }}>
            Open Tournaments
          </h1>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: "#9ca3af" }}>
            Join a tournament and compete!
          </p>
        </div>

        {/* SUCCESS / ERROR MESSAGE */}
        {message && (
          <div style={{
            background: message.includes("successfully") ? "#f0fdf4" : "#fef2f2",
            border: `1px solid ${message.includes("successfully") ? "#bbf7d0" : "#fca5a5"}`,
            borderRadius: 8,
            padding: "12px 16px",
            marginBottom: 20,
            color: message.includes("successfully") ? "#15803d" : "#dc2626",
            fontSize: 13,
          }}>
            {message}
            {/* show dashboard link on success */}
            {message.includes("successfully") && (
              <Link to="/dashboard" style={{ color: "#4a429f", fontWeight: 600, marginLeft: 6 }}>
                Go to Dashboard →
              </Link>
            )}
          </div>
        )}

        {/* LOADING */}
        {loading && (
          <p style={{ color: "#9ca3af", fontSize: 14 }}>Loading tournaments…</p>
        )}

        {/* EMPTY STATE */}
        {!loading && tournaments.length === 0 && !message && (
          <div style={{ textAlign: "center", padding: "48px 0", color: "#9ca3af" }}>
            <p style={{ fontSize: 40, margin: 0 }}>🏟️</p>
            <p style={{ fontSize: 15, fontWeight: 600, color: "#1f2937", margin: "12px 0 4px" }}>
              No open tournaments right now
            </p>
            <p style={{ fontSize: 13, margin: 0 }}>
              Create one from your{" "}
              <Link to="/dashboard" style={{ color: "#4a429f", fontWeight: 600 }}>
                Dashboard
              </Link>
            </p>
          </div>
        )}

        {/* TOURNAMENT LIST */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {tournaments.map(t => (
            <div
              key={t.id}
              style={{
                background: "#fff",
                border: "1px solid #e5e7eb",
                borderRadius: 12,
                padding: "16px 20px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 16,
                flexWrap: "wrap",
              }}
            >
              {/* LEFT — tournament info */}
              <div style={{ flex: 1 }}>
                {/* tournament type badge */}
                <span style={{
                  background: "#eff6ff",
                  color: "#1d4ed8",
                  border: "1px solid #bfdbfe",
                  padding: "2px 8px",
                  borderRadius: 20,
                  fontSize: 10,
                  fontWeight: 700,
                  display: "inline-block",
                  marginBottom: 6,
                }}>
                  {t.type || "Tournament"}
                </span>

                {/* tournament name */}
                <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#1f2937" }}>
                  {t.name}
                </h3>

                {/* players count */}
                <p style={{ margin: "4px 0 0", fontSize: 12, color: "#9ca3af" }}>
                  {t.current_players || 0} / {t.max_players} players joined
                </p>

                {/* player count progress bar */}
                <div style={{ height: 4, background: "#f3f4f6", borderRadius: 2, overflow: "hidden", marginTop: 8, maxWidth: 200 }}>
                  <div style={{
                    width: `${Math.min(((t.current_players || 0) / t.max_players) * 100, 100)}%`,
                    height: "100%",
                    background: "#4a429f",
                    borderRadius: 2,
                  }} />
                </div>
              </div>

              {/* RIGHT — join button */}
              <button
                onClick={() => handleJoin(t.id)}
                disabled={joining === t.id}
                style={{
                  background: joining === t.id ? "#9ca3af" : "#4a429f",
                  color: "#fff",
                  border: "none",
                  padding: "9px 20px",
                  borderRadius: 8,
                  cursor: joining === t.id ? "default" : "pointer",
                  fontWeight: 700,
                  fontSize: 13,
                  fontFamily: "'Poppins', sans-serif",
                  flexShrink: 0,
                }}
              >
                {joining === t.id ? "Joining…" : "Join"}
              </button>
            </div>
          ))}
        </div>

      </main>
    </div>
  );
}