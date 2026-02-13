const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// PostgreSQL connection
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'tododb',
  user: process.env.DB_USER || 'todouser',
  password: process.env.DB_PASSWORD || 'todopass',
});

// Initialize database
const initDB = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS todos (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        completed BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Database initialized');
  } catch (err) {
    console.error('Database initialization error:', err);
  }
};

initDB();

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Get all todos
app.get('/api/todos', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM todos ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create todo
app.post('/api/todos', async (req, res) => {
  try {
    const { title } = req.body;
    const result = await pool.query(
      'INSERT INTO todos (title) VALUES ($1) RETURNING *',
      [title]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update todo
app.put('/api/todos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, completed } = req.body;
    const result = await pool.query(
      'UPDATE todos SET title = COALESCE($1, title), completed = COALESCE($2, completed) WHERE id = $3 RETURNING *',
      [title, completed, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete todo
app.delete('/api/todos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM todos WHERE id = $1', [id]);
    res.json({ message: 'Todo deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

