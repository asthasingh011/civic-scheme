const express = require("express");
const mysql = require("mysql"); 
const cors = require("cors");

const app = express();
app.use(cors());

// 🔗 CONNECT DATABASE
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "CaptureCare11", // or "root" if you set password
  database: "schemes_db"
});

// ✅ CHECK CONNECTION
db.connect(err => {
  if (err) {
    console.log("❌ DB connection failed:", err);
  } else {
    console.log("✅ Connected to MySQL");
  }
});

// 📡 API
app.get("/schemes", (req, res) => {
  db.query("SELECT * FROM schemes", (err, result) => {
    if (err) {
      console.log(err);
      res.send(err);
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
        res.send(err);
      } else {
        res.json(result);
      }
    }
  );
});
app.listen(3000, () => {
  console.log("🚀 Server running at http://localhost:3000");
});
const path = require("path");

// serve frontend files
app.use(express.static(__dirname));

// default route
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});