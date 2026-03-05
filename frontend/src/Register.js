import { useState } from "react";

function Register() {
  const [username, setUsername] = useState("");
  const [first_name, setFirstName] = useState("");
  const [last_name, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loginError, setError] = useState("");

  const handleSubmit = async () => {
    const response = await fetch("http://localhost:8080/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username,
        first_name,
        last_name,
        password,
        email,
      }),
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
        placeholder="firstName"
        value={first_name}
        onChange={(e) => setFirstName(e.target.value)}
      />
      <br />
      <br />

      <input
        placeholder="lastName"
        value={last_name}
        onChange={(e) => setLastName(e.target.value)}
      />
      <br />
      <br />

      <input
        placeholder="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
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

      <button onClick={handleSubmit}>Submit</button>

      <p>{message}</p>
      <p>{loginError}</p>
    </div>
  );
}
export default Register;
