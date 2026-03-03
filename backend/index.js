const express = require("express");
const register = require("./routes/register")

const app = express();

app.use(express.json());
app.use("/api/register",register)

app.get("/", (req, res) => {
  res.send("Server is working!");
});

app.listen(8080, () => {
  console.log("Server running on port 8080");
});
