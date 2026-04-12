import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Register from "./Register";
import Login from "./Login";
import Main from "./Main";
import Dashboard from "./Dashboard";
import UserProfile from "./UserProfile";
import "./App.css";

function App() {
  return (
    <Router>
      <div className="header">
        <div className="left">
          <Link to="/" className="btn">
            Main
          </Link>
        </div>

        <div className="right">
          <Link to="/register" className="btn">Register</Link>
          <Link to="/login" className="btn">Login</Link>
          
        </div>
      </div>

      <Routes>
        <Route path="/" element={<Main />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<UserProfile />} />
      </Routes>
    </Router>
  );
}

export default App;
