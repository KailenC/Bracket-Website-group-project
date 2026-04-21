import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";

export default function TournamentPage() {
  const { id } = useParams();
  const [tournament, setTournament] = useState(null);
  const [bracket, setBracket] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");

    fetch(`http://localhost:8080/tournaments/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then(setTournament);

    fetch(`http://localhost:8080/tournaments/getBracket/${id}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ id }),
    })
      .then((r) => r.json())
      .then(setBracket);
  }, [id]);

  if (!tournament) return <div>Loading...</div>;

  return (
    <div>
      <h1>{tournament.name}</h1>
      <p>Status: {tournament.status}</p>

      <h2>Bracket</h2>
      {bracket.map((m) => (
        <div key={m.id}>
          Round {m.round} - Match {m.match_number}
        </div>
      ))}
    </div>
  );
}
