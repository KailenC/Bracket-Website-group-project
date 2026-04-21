require("dotenv").config();

const express = require("express");
const cors = require("cors");
const app = express();

app.use(express.json());
app.use(cors());

const authRoutes = require("../src/routes/auth.routes");
const tournamentRoutes = require("../src/routes/tournaments.routes");
const bracketRoutes = require("../src/routes/bracket.routes");

// when the app recieves these requests, it sends them to routes
app.use("/auth", authRoutes);
app.use("/tournaments", tournamentRoutes);
app.use("/brackets", bracketRoutes);

app.get("/", (req, res) => {
  res.send("Server is working!");
});

app.listen(8080, () => {
  console.log("Server running on port 8080");
});
