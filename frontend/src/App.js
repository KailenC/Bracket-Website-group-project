import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from "react-router-dom";
import Register from "./Register";
import Login from "./Login";
import Main from "./Main";
import Dashboard from "./Dashboard";
import UserProfile from "./UserProfile";
import "./App.css";

function AppDefault(){
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const isLoggedIn = !!token;

  //logou = no token then default to main page
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    navigate("/");
  };

  return(
    <>
      <div className="header">
        <div className="left">
          <Link to="/" className="btn">
            Main
          </Link>
        </div>

        <div className="right">
          {!isLoggedIn ? (
          <>
          <Link to="/register" className="btn">Register</Link>
          <Link to="/login" className="btn">Login</Link>
          </>
          ) : (
          <>
          <Link to="/dashboard" className="btn">Dashboard</Link>
          <button onClick={logout} className="btn">Logout</button>
          </>)}
        </div>
      </div>
      
      <Routes>
        <Route path="/" element={<Main />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<UserProfile />} />
      </Routes>
    
    </>
  );
}

function App() {
  return (
    <Router>
      <AppDefault />
    </Router>
  );
}

export default App;
