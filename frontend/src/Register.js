import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Register() {
  const [username, setUsername] = useState("");
  const [first_name, setFirstName] = useState("");
  const [last_name, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loginError, setError] = useState("");

  
  const navigate = useNavigate();

  const handleSubmit = async () => {

    setMessage("");
    setError("");

    try{
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
      if(!response.ok){
        setError(data.error || "Registration failed. Please try again."); // the failure part works idk if the success part works I need the database to test that
        return;
      }
      else if(response.ok){
        setMessage(data.message || "Registration successful! You can now log in.");
      }
    }catch (error) {
      setError("An error occurred during registration. Please try again.");
      return;
    }


  };

  return (
    <div className="center-register">
      <h1>Register</h1>

      <input
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        className="text-entry"
      />

      <input
        placeholder="First Name"
        value={first_name}
        onChange={(e) => setFirstName(e.target.value)}
        className="text-entry"
      />

      <input
        placeholder="Last Name"
        value={last_name}
        onChange={(e) => setLastName(e.target.value)}
        className="text-entry"
      />

      <input
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="text-entry"
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="text-entry"
      />

      <button onClick={handleSubmit} className="btn">Submit</button>

      {message && (
        <div>
          <p className="success-message">{message}</p>
          <button className="btn" onClick={() => navigate("/login")}>
            Go to Login
          </button>
        </div>
      )} 

      
      {loginError && <p className="error-message">{loginError}</p>}
      
    </div>
  );
}
export default Register;
