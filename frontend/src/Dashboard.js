import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";

// fake data to show
const MOCK_BRACKETS = [
  {
    id: 1,
    name: "NFL Playoffs 2025",
    sport: "NFL",
    teams: 8,
    status: "active",
    progress: 60,
  },
  {
    id: 2,
    name: "March Madness",
    sport: "NCAA",
    teams: 16,
    status: "active",
    progress: 35,
  },
  {
    id: 3,
    name: "NBA Finals Run",
    sport: "NBA",
    teams: 4,
    status: "completed",
    progress: 100,
  },
  {
    id: 4,
    name: "World Cup Group A",
    sport: "FIFA",
    teams: 6,
    status: "active",
    progress: 50,
  },
];

const SPORT_COLORS = {
  NFL: { bg: "#fff7ed", text: "#c2410c", border: "#fed7aa" },
  NBA: { bg: "#eff6ff", text: "#1d4ed8", border: "#bfdbfe" },
  NCAA: { bg: "#f0fdf4", text: "#15803d", border: "#bbf7d0" },
  FIFA: { bg: "#fefce8", text: "#a16207", border: "#fde68a" },
  NHL: { bg: "#faf5ff", text: "#7e22ce", border: "#e9d5ff" },
  MLB: { bg: "#fdf2f8", text: "#be185d", border: "#fbcfe8" },
};

//The cards that show the bracket situation, like how many active brackets, completed brackets, and teams tracked
function StatCard({ label, value, accent }) {
  return (
    <div
      style={{
        background: "#f9fafb",
        border: "1px solid #e5e7eb",
        borderRadius: 10,
        padding: "12px 14px",
        borderTop: `3px solid ${accent}`,
      }}
    >
      <p
        style={{
          margin: 0,
          fontSize: 10,
          color: "#9ca3af",
          textTransform: "uppercase",
          letterSpacing: "0.8px",
        }}
      >
        {label}
      </p>
      <p
        style={{
          margin: "4px 0 0",
          fontSize: 28,
          fontWeight: 800,
          color: "#1f2937",
          lineHeight: 1,
        }}
      >
        {value}
      </p>
    </div>
  );
}

//Single bracket
function BracketCard({ bracket, onOpen }) {
  const c = SPORT_COLORS[bracket.sport] || {
    bg: "#f9fafb",
    text: "#374151",
    border: "#e5e7eb",
  };
  const isLive = bracket.status !== "completed";

  return (
    <div
      onClick={() => onOpen(bracket.id)}
      style={{
        background: "#fff",
        border: "1px solid #e5e7eb",
        borderRadius: 10,
        padding: "14px",
        cursor: "pointer",
        transition: "border-color 0.15s",
        display: "flex",
        flexDirection: "column",
        gap: 8,
      }}
      onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#4a429f")}
      onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#e5e7eb")}
    >
      {/* Sport badge + status */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span
          style={{
            background: c.bg,
            color: c.text,
            border: `1px solid ${c.border}`,
            padding: "2px 9px",
            borderRadius: 20,
            fontSize: 10,
            fontWeight: 700,
          }}
        >
          {bracket.sport}
        </span>
        <span
          style={{
            background: isLive ? "#fff7ed" : "#f0fdf4",
            color: isLive ? "#c2410c" : "#15803d",
            border: `1px solid ${isLive ? "#fed7aa" : "#bbf7d0"}`,
            padding: "2px 8px",
            borderRadius: 20,
            fontSize: 10,
          }}
        >
          {isLive ? "● Live" : "✓ Done"}
        </span>
      </div>

      <h3
        style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "#1f2937" }}
      >
        {bracket.name}
      </h3>
      <p style={{ margin: 0, fontSize: 11, color: "#9ca3af" }}>
        {bracket.teams} teams
      </p>

      {/* Progress bar */}
      <div>
        <div
          style={{
            height: 4,
            background: "#f3f4f6",
            borderRadius: 2,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: bracket.progress + "%",
              height: "100%",
              background: isLive ? c.text : "#16a34a",
              borderRadius: 2,
            }}
          />
        </div>
        <p style={{ margin: "4px 0 0", fontSize: 10, color: "#9ca3af" }}>
          {bracket.progress}% complete
        </p>
      </div>

      <p style={{ margin: 0, fontSize: 11, fontWeight: 600, color: "#9ca3af" }}>
        Open bracket →
      </p>
    </div>
  );
}

// Modal for creating a new bracket, with inputs for bracket name and sport selection
function CreateModal({ onClose, onCreate }) {
  const [name, setName] = useState("");
  const [sport, setSport] = useState("");
  const [maxPlayers, setMaxPlayers] = useState(8);

  return (
    <div
      onClick={(e) => e.target === e.currentTarget && onClose()}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.4)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 999,
      }}
    >
      <div
        style={{
          background: "#fff",
          border: "1px solid #e5e7eb",
          borderRadius: 14,
          padding: "24px",
          width: 360,
          display: "flex",
          flexDirection: "column",
          gap: 16,
          boxShadow: "0 4px 24px rgba(0,0,0,0.1)",
        }}
      >
        <h2
          style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "#1f2937" }}
        >
          New Bracket
        </h2>

        {/* name */}
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <label style={S.label}>Bracket Name</label>
          <input
            style={S.input}
            placeholder="e.g. NFL Playoffs 2025"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        {/* sport */}
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <label style={S.label}>Sport Type</label>
          <input
            style={S.input}
            placeholder="e.g. NFL, NBA, NCAA"
            value={sport}
            onChange={(e) => setSport(e.target.value)}
          />
        </div>

        {/* max players */}
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <label style={S.label}>Max Players</label>
          <select
            style={S.input}
            value={maxPlayers}
            onChange={(e) => setMaxPlayers(Number(e.target.value))}
          >
            {[4, 8, 16, 32, 64].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>

        {/* buttons */}
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button style={S.ghost} onClick={onClose}>
            Cancel
          </button>
          <button
            style={{ ...S.primary, opacity: name.trim() ? 1 : 0.4 }}
            onClick={() => name.trim() && onCreate(name, sport, maxPlayers)}
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
}

// the main dashboard
export default function Dashboard() {
  const navigate = useNavigate();
  const [brackets, setBrackets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [username, setUsername] = useState("Champ");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    // Try to read username out of the token
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      setUsername(payload.username || payload.sub || "Champ");
    } catch {}

    // Fetch brackets from backend
    fetch("http://localhost:8080/tournaments/my", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then((data) =>
        setBrackets(
          data.map((t) => ({
            id: t.id,
            name: t.name,
            sport: t.type,
            teams: t.max_players,
            status: t.status,
            progress: 0,
          })),
        ),
      )
      .catch(() => setBrackets(MOCK_BRACKETS)) // use fake data if backend not ready
      .finally(() => setLoading(false));
  }, [navigate]);

  const handleCreate = async (name, sport, players) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch("http://localhost:8080/tournaments/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          tournament_name: name,
          tournament_type: sport,
          max_players: players,
        }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      const t = data.tournament;

      setBrackets((prev) => [
        {
          id: t.id,
          name: t.name,
          sport: t.type,
          teams: t.max_players,
          status: t.status,
          progress: 0,
        },
        ...prev,
      ]);
    } catch {
      // Add locally if backend not ready yet
      setBrackets((prev) => [
        {
          id: Date.now(),
          name,
          sport,
          teams: 0,
          status: "active",
          progress: 0,
        },
        ...prev,
      ]);
    }
    setShowModal(false);
  };

  const active = brackets.filter((b) => b.status === "active").length;
  const completed = brackets.filter((b) => b.status === "completed").length;
  const teams = brackets.reduce((s, b) => s + (b.teams || 0), 0);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#fff",
        fontFamily: "'Poppins', sans-serif",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: "aliceblue",
          padding: "16px 20px",
          borderBottom: "1px solid #e5e7eb",
          position: "sticky",
          top: 0,
          zIndex: 100,
        }}
      >
        <Link
          to="/"
          style={{
            fontWeight: 700,
            fontSize: 16,
            color: "#1f2937",
            textDecoration: "none",
          }}
        >
          🏆 BracketMaker
        </Link>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          {/*
          <Link
            to="/dashboard"
            className="btn"
            style={{
              background: "#4a429f",
              color: "#fff",
              padding: "8px 16px",
              borderRadius: 5,
              fontSize: 13,
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            Dashboard
          </Link>
          <Link
            to="/profile"
            className="btn"
            style={{
              padding: "8px 16px",
              borderRadius: 5,
              fontSize: 13,
              textDecoration: "none",
            }}
          >
            My Profile
          </Link>
*/}
          <button
            className="btn"
            onClick={() => {
              localStorage.removeItem("token");
              navigate("/login");
            }}
          >
            Log out
          </button>
        </div>
      </div>

      <main style={{ maxWidth: 1000, margin: "0 auto", padding: "28px 20px" }}>
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            marginBottom: 20,
          }}
        >
          <div>
            <p
              style={{
                margin: 0,
                fontSize: 11,
                color: "#9ca3af",
                textTransform: "uppercase",
                letterSpacing: "1px",
              }}
            >
              Welcome back
            </p>
            <h1
              style={{
                margin: "4px 0 0",
                fontSize: 30,
                fontWeight: 900,
                color: "#1f2937",
              }}
            >
              {username}
            </h1>
          </div>
          <button style={S.primary} onClick={() => setShowModal(true)}>
            + New Bracket
          </button>
        </div>

        {/* Stat cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
            gap: 10,
            marginBottom: 24,
          }}
        >
          <StatCard
            label="Total Brackets"
            value={brackets.length}
            accent="#4a429f"
          />
          <StatCard label="Active" value={active} accent="#ea580c" />
          <StatCard label="Completed" value={completed} accent="#16a34a" />
          <StatCard label="Teams Tracked" value={teams} accent="#db2777" />
        </div>

        {/* Brackets */}
        <p
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: "#9ca3af",
            textTransform: "uppercase",
            letterSpacing: "1px",
            marginBottom: 12,
          }}
        >
          Your Brackets
        </p>

        {loading ? (
          <p style={{ color: "#9ca3af" }}>Loading…</p>
        ) : brackets.length === 0 ? (
          <div
            style={{ textAlign: "center", padding: "48px 0", color: "#9ca3af" }}
          >
            <p style={{ fontSize: 40 }}>🏟️</p>
            <p>No brackets yet. Hit "+ New Bracket" to start!</p>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
              gap: 12,
            }}
          >
            {brackets.map((b) => (
              <BracketCard
                key={`${b.id}-${b.name}`}
                bracket={b}
                onOpen={() => navigate(`/tournament/${b.id}`)}
              />
            ))}
          </div>
        )}
      </main>

      {showModal && (
        <CreateModal
          onClose={() => setShowModal(false)}
          onCreate={handleCreate}
        />
      )}
    </div>
  );
}

// Shared style tokens
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
