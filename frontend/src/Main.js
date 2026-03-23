import { Link } from "react-router-dom";

function Main() {
  return (
    <div className="center-container">
      <h1>Welcome to Bracket Land!!</h1>
      <h2>Join the community and compete!</h2>

      <h3>
        New? <Link to="/register" className="btn">Register</Link> Now
      </h3>

      <h2>Host a Tournament!!</h2>
      <h3>Browse Existing Tournaments</h3>
    </div>
  );
}

export default Main;