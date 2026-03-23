import { useState } from "react";
// import { login } from "../../backend/src/controllers/auth.controller";

function Login() {
  const [username, setUsername] = useState("");
  const [loginError, setError] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleLogin = async () => {

    setMessage("");
    setError("");

    try{
    const response = await fetch("http://localhost:8080/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });
    
  const data = await response.json();
    if (!response.ok){
      setError(data.error || "Login failed. Check your username or password.");
      return;
    }
    else{
      setError(data.message || "Login successful!");
    }

  }catch (error) {
    setError("An error occurred during login. Please try again.");
    return;
  }
  };

  return (
    <div className="center-register">
      <h1>Login</h1>

      <input
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        className="text-entry"
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="text-entry"
      />

      <button onClick={handleLogin} className="btn">
        Submit
      </button>
      <p>Undeveloped Forgot your Password? Coming Soon!!</p>

      {message && <p className="success-message">{message}</p>}
      {loginError && <p className="error-message">{loginError}</p>}

    </div>
  );
}
export default Login;
