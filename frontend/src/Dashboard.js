import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    const savedUsername = localStorage.getItem("username");

    if (!token) {
      navigate("/login");
      return;
    }

    setUsername(savedUsername || "User");
  }, [navigate]);

  return (
    <div>
      <div className="dashboard-hero">
        <h1>Welcome Back, {username}!</h1>
        <p>Your account is connected. Tournament features coming next.</p>
      </div>

      <div className="footer">
        <p>© 2024 Bracket Land. All rights reserved.</p>
      </div>
    </div>
  );
}

export default Dashboard;