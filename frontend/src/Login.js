import { useState } from "react";
// import { login } from "../../backend/src/controllers/auth.controller";

function Login() {
  const [username, setUsername] = useState("");
  const [loginError, setError] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleLogin = async () => {
    const response = await fetch("http://localhost:8080/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();
    setMessage(data.message);
    setError(data.error);
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Password Test</h1>

      <input
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <br />
      <br />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <br />
      <br />

      <button onClick={handleLogin}>Submit</button>

      <p>{message}</p>
      <p>{loginError}</p>
    </div>
  );
}
export default Login;
