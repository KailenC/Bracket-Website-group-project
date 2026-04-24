import { Link } from "react-router-dom";
function Main() {

  const token = localStorage.getItem("token");
  const isLoggedIn = !!token;

  return (
    <div>
      <div className="center-container">
        <h1>Welcome to Bracket Builder!</h1>
        <h2>Join the community and compete!</h2>

        {(!isLoggedIn) && (

        <h3>
          New?{" "}
          <Link to="/register" className="btn">
            Register
          </Link>{" "}
          Now
        </h3>
      )}
      </div>

      <br></br>
      <br></br>

      <div className="tournament-section">
        <div className="tournament-header">
          <h2>Join a Tournament!!</h2>
          <h3>Browse Existing Tournaments</h3>
        </div>

        <div className="tournament-grid">
          <div className="tournament-box">
            <h4>Example Tournament 1</h4>
            <p>UNO</p>
            <button className="btn"> Join! Placeholder Route</button>
          </div>
        </div>
      </div>
      <br></br>
      <div className="footer">
        <p>© 2026 Bracket Builder. All rights reserved.</p>
      </div>
    </div>
  );
}
export default Main;
