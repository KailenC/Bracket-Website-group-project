import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Register from "./Register";
import Login from "./Login";

function App() {
  return (
    <Router>
      <nav style={{ padding: "10px" }}>
        <Link to="/register">Register</Link> | 
        <Link to="/login">Login</Link> |
        <Link to="/main">Main</Link>
      </nav>

      <h1> Welcome to Bracket Land</h1>
      <h2>Join the community and compete!</h2>
      <h3> New? <Link to="/register">Register</Link> Now</h3>
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </Router>
  );
}

export default App;
