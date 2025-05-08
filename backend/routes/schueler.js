import express from 'express';
import { pool } from '../db/pool.js';

const router = express.Router();

// Get all quotes
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM schueler_quotes');
    res.status(200).json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM schueler_quotes WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Quote not found' });
    }
    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

/**
 * @swagger
 * /api/quotes/random/schueler:
 *   get:
 *     summary: Get random Schueler quote
 *     responses:
 *       200:
 *         description: Quote found
 *       404:
 *         description: Quote not found
 */
router.get('/random', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM schueler_quotes ORDER BY RANDOM() LIMIT 1');
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'No quotes found' });
    }
    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Create quote
router.post('/', express.json(), async (req, res) => {
  const { message, timestamp } = req.body;
  if (!message || !timestamp) {
    return res.status(400).json({ error: 'Missing fields' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO schueler_quotes (message, timestamp) VALUES ($1, $2) RETURNING *',
      [message, timestamp]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Update quote
router.patch('/:id', express.json(), async (req, res) => {
  const { id } = req.params;
  const { message, timestamp } = req.body;
  try {
    const result = await pool.query(
      'UPDATE schueler_quotes SET message = $1, timestamp = $2 WHERE id = $3 RETURNING *',
      [message, timestamp, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Quote not found' });
    }
    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Delete quote
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM schueler_quotes WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Quote not found' });
    }
    res.status(200).json({ message: 'Quote deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
