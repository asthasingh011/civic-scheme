const express = require("express");
const mysql = require("mysql");
const cors = require("cors");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// 🔗 LOCAL DATABASE CONNECTION
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "CaptureCare11", // 🔥 change if your password is different
  database: "schemes_db"
});

// ✅ CONNECT TO DB
db.connect(err => {
  if (err) {
    console.log("❌ DB connection failed:", err);
  } else {
    console.log("✅ Connected to MySQL");
  }
});

// 📡 GET ALL SCHEMES
app.get("/schemes", (req, res) => {
  db.query("SELECT * FROM schemes", (err, result) => {
    if (err) {
      console.log("❌ Error fetching schemes:", err);
      res.status(500).send(err);
    } else {
      res.json(result);
    }
  });
});

// 📊 DOMAIN COUNT API
app.get("/domain-count", (req, res) => {
  db.query(
    "SELECT domain, COUNT(*) AS total FROM schemes GROUP BY domain",
    (err, result) => {
      if (err) {
        console.log("❌ Error fetching domain count:", err);
        res.status(500).send(err);
      } else {
        res.json(result);
      }
    }
  );
});

// 🌐 DEFAULT ROUTE (optional)
app.get("/", (req, res) => {
  res.send("Server is running 🚀");
});

// 🚀 START SERVER
const PORT = 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});