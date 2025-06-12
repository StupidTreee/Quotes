import express from 'express';
import { pool } from '../db/pool.js';

const router = express.Router();
const validTypes = ['schueler', 'lehrer'];

function getTable(type) {
  if (!validTypes.includes(type)) throw new Error('Invalid type');
  return `${type}_quotes`;
}

/**
 * @swagger
 * /api/quotes/{type}:
 *   get:
 *     summary: Get all quotes of a given type
 *     parameters:
 *       - in: path
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *           enum: [schueler, lehrer]
 *     responses:
 *       200:
 *         description: List of quotes
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Quote'
 *       400:
 *         description: Invalid type
 *       500:
 *         description: Internal Server Error
 */
    router.get('/:type', async (req, res) => {
  const { type } = req.params;
  try {
    const table = getTable(type);
    const result = await pool.query(`SELECT * FROM ${table}`);
    res.status(200).json(result.rows);
  } catch (err) {
    res.status(400).json({ error: 'Invalid type' });
  }
});

/**
 * @swagger
 * /api/quotes/{type}/random:
 *   get:
 *     summary: Get a random quote of a given type
 *     parameters:
 *       - in: path
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *           enum: [schueler, lehrer]
 *     responses:
 *       200:
 *         description: Quote found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Quote'
 *       404:
 *         description: No quotes found
 *       400:
 *         description: Invalid type
 *       500:
 *         description: Internal Server Error
 */
router.get('/:type/random', async (req, res) => {
  const { type } = req.params;
  try {
    const table = getTable(type);
    const result = await pool.query(`SELECT * FROM ${table} ORDER BY RANDOM() LIMIT 1`);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'No quotes found' });
    }
    res.status(200).json(result.rows[0]);
  } catch (err) {
    res.status(400).json({ error: 'Invalid type' });
  }
});

/**
 * @swagger
 * /api/quotes/{type}/quote/{id}:
 *   get:
 *     summary: Get a quote by ID and type
 *     parameters:
 *       - in: path
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *           enum: [schueler, lehrer]
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Quote found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Quote'
 *       404:
 *         description: Quote not found
 *       400:
 *         description: Invalid type
 *       500:
 *         description: Internal Server Error
 */
router.get('/:type/quote/:id', async (req, res) => {
  const { type, id } = req.params;
  try {
    const table = getTable(type);
    const result = await pool.query(`SELECT * FROM ${table} WHERE id = $1`, [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Quote not found' });
    }
    res.status(200).json(result.rows[0]);
  } catch (err) {
    res.status(400).json({ error: 'Invalid type' });
  }
});

/**
 * @swagger
 * /api/quotes/{type}:
 *   post:
 *     summary: Create a new quote of a given type
 *     parameters:
 *       - in: path
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *           enum: [schueler, lehrer]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - message
 *               - timestamp
 *             properties:
 *               message:
 *                 type: string
 *               timestamp:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       201:
 *         description: Quote created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Quote'
 *       400:
 *         description: Missing fields or invalid type
 *       500:
 *         description: Internal Server Error
 */
router.post('/:type', express.json(), async (req, res) => {
  const { type } = req.params;
  const { message, timestamp } = req.body;
  if (!message || !timestamp) {
    return res.status(400).json({ error: 'Missing fields' });
  }
  try {
    const table = getTable(type);
    const result = await pool.query(
      `INSERT INTO ${table} (message, timestamp) VALUES ($1, $2) RETURNING *`,
      [message, timestamp]
    );
    // Hole die Socket.IO-Instanz
    const io = req.app.get('socketio');
    // Sende eine Benachrichtigung (z.B. "quoteAdded")
    io.emit("quoteAdded", { type, quote: result.rows[0] });
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(400).json({ error: 'Invalid type' });
  }
});

/**
 * @swagger
 * /api/quotes/{type}/{id}:
 *   patch:
 *     summary: Update a quote by ID and type
 *     parameters:
 *       - in: path
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *           enum: [schueler, lehrer]
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               message:
 *                 type: string
 *               timestamp:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Quote updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Quote'
 *       404:
 *         description: Quote not found
 *       400:
 *         description: Invalid type
 *       500:
 *         description: Internal Server Error
 */
router.patch('/:type/:id', express.json(), async (req, res) => {
  const { type, id } = req.params;
  const { message, timestamp } = req.body;
  try {
    const table = getTable(type);
    const result = await pool.query(
      `UPDATE ${table} SET message = $1, timestamp = $2 WHERE id = $3 RETURNING *`,
      [message, timestamp, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Quote not found' });
    }
    const io = req.app.get('socketio');
    io.emit("quoteUpdated", { type, quote: result.rows[0] });
    res.status(200).json(result.rows[0]);
  } catch (err) {
    res.status(400).json({ error: 'Invalid type' });
  }
});

/**
 * @swagger
 * /api/quotes/{type}/{id}:
 *   delete:
 *     summary: Delete a quote by ID and type
 *     parameters:
 *       - in: path
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *           enum: [schueler, lehrer]
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Quote deleted
 *       404:
 *         description: Quote not found
 *       400:
 *         description: Invalid type
 *       500:
 *         description: Internal Server Error
 */
router.delete('/:type/:id', async (req, res) => {
  const { type, id } = req.params;
  try {
    const table = getTable(type);
    const result = await pool.query(`DELETE FROM ${table} WHERE id = $1 RETURNING *`, [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Quote not found' });
    }
    const io = req.app.get('socketio');
    io.emit("quoteDeleted", { type, id });
    res.status(200).json({ message: 'Quote deleted' });
  } catch (err) {
    res.status(400).json({ error: 'Invalid type' });
  }
});

/**
 * @swagger
 * components:
 *   schemas:
 *     Quote:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         message:
 *           type: string
 *         timestamp:
 *           type: string
 *           format: date-time
 */

export default router;