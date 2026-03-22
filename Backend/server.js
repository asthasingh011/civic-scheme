const express = require("express");
const mysql = require("mysql");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// 🔐 DATABASE CONNECTION (using ENV variables)
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

// ✅ CONNECT DB
db.connect(err => {
  if (err) {
    console.log("❌ DB connection failed:", err);
  } else {
    console.log("✅ Connected to MySQL");
  }
});

// 📡 APIs
app.get("/schemes", (req, res) => {
  db.query("SELECT * FROM schemes", (err, result) => {
    if (err) {
      console.log(err);
      res.status(500).send(err);
    } else {
      res.json(result);
    }
  });
});

app.get("/domain-count", (req, res) => {
  db.query(
    "SELECT domain, COUNT(*) AS total FROM schemes GROUP BY domain",
    (err, result) => {
      if (err) {
        console.log(err);
        res.status(500).send(err);
      } else {
        res.json(result);
      }
    }
  );
});

// 🌐 PORT FIX (VERY IMPORTANT FOR RENDER)
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});