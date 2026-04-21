import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";

//Some Fake data to shows until the backend is ready ────────────────────────────
const MOCK_PROFILE = {
  username: "SportsKing",
  email: "sportsking@email.com",
  favoriteTeam: "Kansas City Chiefs",
  joinDate: "2024-11-01",
};

const MOCK_BRACKETS = [
  {
    id: 1,
    name: "NFL Playoffs 2025",
    sport: "NFL",
    status: "active",
    createdAt: "2025-01-10",
  },
  {
    id: 2,
    name: "March Madness",
    sport: "NCAA",
    status: "active",
    createdAt: "2025-03-14",
  },
  {
    id: 3,
    name: "NBA Finals Run",
    sport: "NBA",
    status: "completed",
    createdAt: "2025-04-01",
  },
  {
    id: 4,
    name: "World Cup Group A",
    sport: "FIFA",
    status: "completed",
    createdAt: "2024-11-20",
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

// Main page for user to view their profile info and bracket history
export default function UserProfile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [brackets, setBrackets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    // Fetch profile and bracket history at the same time

    console.log("Starting fetch...");
    Promise.all([
      fetch("http://localhost:8080/auth/profile", {
        headers: { Authorization: `Bearer ${token}` },
      }),
      fetch("http://localhost:8080/tournaments", {
        headers: { Authorization: `Bearer ${token}` },
      }),
    ])
      .then(async ([pRes, bRes]) => {
        console.log("profile status:", pRes.status);
        console.log("brackets status:", bRes.status);
        if (!pRes.ok || !bRes.ok) throw new Error();
        const [p, b] = await Promise.all([pRes.json(), bRes.json()]);
        setProfile(p);
        setBrackets(b);
      })
      .catch(() => {
        // Use fake data if backend not ready
        setProfile(MOCK_PROFILE);
        setBrackets(MOCK_BRACKETS);
      })
      .finally(() => setLoading(false));
  }, [navigate]);

  const initials = profile ? profile.username.slice(0, 2).toUpperCase() : "?";
  const total = brackets.length;
  const completed = brackets.filter((b) => b.status === "completed").length;
  const active = brackets.filter((b) => b.status === "active").length;

  if (loading)
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          fontFamily: "'Poppins', sans-serif",
          color: "#9ca3af",
        }}
      >
        Loading…
      </div>
    );

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#fff",
        fontFamily: "'Poppins', sans-serif",
      }}
    >
      {/* ── Navbar ── */}
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
          <Link
            to="/dashboard"
            className="btn"
            style={{
              padding: "8px 16px",
              borderRadius: 5,
              fontSize: 13,
              textDecoration: "none",
            }}
          >
            Dashboard
          </Link>
          <Link
            to="/profile"
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
            My Profile
          </Link>
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

      <main
        style={{
          maxWidth: 600,
          margin: "0 auto",
          padding: "28px 20px",
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
        {/* ── SECTION 1: Who you are ── */}
        <div style={S.card}>
          <p style={S.sectionTitle}>Profile</p>

          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            {/* Avatar */}
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: "50%",
                background: "#4a429f",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 20,
                fontWeight: 800,
                color: "#fff",
                flexShrink: 0,
              }}
            >
              {initials}
            </div>

            {/* Info — read only, no editing */}
            <div>
              <p
                style={{
                  margin: 0,
                  fontSize: 20,
                  fontWeight: 800,
                  color: "#1f2937",
                }}
              >
                {profile.username}
              </p>
              <p style={{ margin: "3px 0 0", fontSize: 12, color: "#9ca3af" }}>
                {profile.email}
              </p>
              <p style={{ margin: "3px 0 0", fontSize: 12, color: "#9ca3af" }}>
                Member since {profile.joinDate}
              </p>
              {profile.favoriteTeam && (
                <p
                  style={{
                    margin: "6px 0 0",
                    fontSize: 13,
                    fontWeight: 600,
                    color: "#1f2937",
                  }}
                >
                  ⭐ {profile.favoriteTeam}
                </p>
              )}
            </div>
          </div>

          {/* Quick stat pills under profile */}
          <div
            style={{
              display: "flex",
              gap: 10,
              marginTop: 16,
              flexWrap: "wrap",
            }}
          >
            <div style={S.pill("#f3f4f6", "#374151")}>
              {total} brackets total
            </div>
            <div style={S.pill("#f0fdf4", "#15803d")}>
              {completed} completed
            </div>
            <div style={S.pill("#fff7ed", "#c2410c")}>{active} active</div>
          </div>
        </div>

        {/* bracket history */}
        <div style={S.card}>
          <p style={S.sectionTitle}>Bracket History</p>

          {brackets.length === 0 ? (
            <p
              style={{
                color: "#9ca3af",
                fontSize: 13,
                textAlign: "center",
                padding: "20px 0",
              }}
            >
              No brackets yet.{" "}
              <Link
                to="/dashboard"
                style={{ color: "#4a429f", fontWeight: 600 }}
              >
                Create one!
              </Link>
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              {brackets.map((b, i) => {
                const c = SPORT_COLORS[b.sport] || {
                  bg: "#f9fafb",
                  text: "#374151",
                  border: "#e5e7eb",
                };
                const isLive = b.status !== "completed";
                const isLast = i === brackets.length - 1;

                return (
                  <div
                    key={b.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "12px 0",
                      borderBottom: isLast ? "none" : "1px solid #f3f4f6",
                      gap: 12,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        flex: 1,
                        minWidth: 0,
                      }}
                    >
                      <span
                        style={{
                          background: c.bg,
                          color: c.text,
                          border: `1px solid ${c.border}`,
                          padding: "2px 8px",
                          borderRadius: 20,
                          fontSize: 10,
                          fontWeight: 700,
                          flexShrink: 0,
                        }}
                      >
                        {b.sport}
                      </span>
                      <span
                        style={{
                          fontSize: 13,
                          fontWeight: 600,
                          color: "#1f2937",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {b.name}
                      </span>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        flexShrink: 0,
                      }}
                    >
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
                      <span style={{ fontSize: 11, color: "#9ca3af" }}>
                        {b.createdAt}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

const S = {
  card: {
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: 12,
    padding: "18px 20px",
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: 700,
    color: "#9ca3af",
    textTransform: "uppercase",
    letterSpacing: "1px",
    margin: "0 0 14px",
  },
  pill: (bg, color) => ({
    background: bg,
    color,
    padding: "3px 10px",
    borderRadius: 20,
    fontSize: 11,
    fontWeight: 600,
  }),
};
