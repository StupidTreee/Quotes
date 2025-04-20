const express = require("express");
const { Pool } = require("pg");
const app = express();
const PORT = 3002;

// PostgreSQL Config
const pool = new Pool({
  host: "localhost",
  user: "quoteuser",
  password: "secret",
  database: "quotes",
  port: 5432,
});

// random quote
app.get("/api/quotes/random", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT * FROM schueler_quotes
      ORDER BY RANDOM()
      LIMIT 1
    `);
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error fetching quote:", err);
    res.status(500).json({ error: "Something went wrong." });
  }
});

app.listen(PORT, () => {
  console.log(`✅ API listening at http://localhost:${PORT}`);
});
