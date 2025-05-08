import pkg from 'pg';
const { Pool } = pkg;

export const pool = new Pool({
  host: "postgres_quotes",
  user: "quoteuser",
  password: "secret",
  database: "quotes",
  port: 5432,
});
