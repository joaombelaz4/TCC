import express from 'express';
import mysql from 'mysql2/promise';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

const dbPool = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'secret',
  database: process.env.DB_NAME || 'tcc',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

function dateToTime(value) {
  return new Date(value).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

function dateToDate(value) {
  return new Date(value).toLocaleDateString('pt-BR');
}

function mapPool(row) {
  return {
    id: row.id,
    name: row.name,
    size: row.size,
    pH: Number(row.current_ph),
    cl: Number(row.current_cl),
    temp: Number(row.temp),
    lastTime: row.last_reading_at ? dateToTime(row.last_reading_at) : null,
    readings: row.readings,
  };
}

app.use(express.json());

app.get('/api/pools', async (req, res) => {
  try {
    const [rows] = await dbPool.query('SELECT * FROM pools ORDER BY id');
    res.json(rows.map(mapPool));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to load pools' });
  }
});

app.get('/api/pools/:id/history', async (req, res) => {
  const poolId = Number(req.params.id);
  if (!poolId) return res.status(400).json({ error: 'Invalid pool id' });

  const limit = Number(req.query.limit) || 1000;

  try {
    const [rows] = await dbPool.query(
      'SELECT recorded_at, ph, cl, temp, status FROM pool_history WHERE pool_id = ? ORDER BY recorded_at DESC LIMIT ?',
      [poolId, limit],
    );
    res.json(rows.map(row => ({
      recorded_at: row.recorded_at ? row.recorded_at.toISOString() : null,
      date: dateToDate(row.recorded_at),
      time: dateToTime(row.recorded_at),
      ph: Number(row.ph),
      cl: Number(row.cl),
      temp: Number(row.temp),
      status: row.status,
    })));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to load pool history' });
  }
});

app.get('/api/alerts', async (req, res) => {
  try {
    const [rows] = await dbPool.query(
      'SELECT pa.id, pa.type, pa.title, pa.msg, pa.occurred_at, p.name AS pool_name FROM pool_alerts pa JOIN pools p ON pa.pool_id = p.id ORDER BY pa.occurred_at DESC',
    );
    res.json(rows.map(row => ({
      id: row.id,
      pool: row.pool_name,
      type: row.type,
      title: row.title,
      msg: row.msg,
      time: dateToTime(row.occurred_at),
    })));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to load alerts' });
  }
});

app.get('/api/settings', async (req, res) => {
  try {
    const [rows] = await dbPool.query('SELECT setting_key, setting_value FROM app_settings');
    res.json(Object.fromEntries(rows.map(row => [row.setting_key, row.setting_value])));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to load settings' });
  }
});

app.post('/api/settings', async (req, res) => {
  const updates = req.body;
  if (typeof updates !== 'object' || updates === null) {
    return res.status(400).json({ error: 'Invalid settings payload' });
  }

  const connection = await dbPool.getConnection();
  try {
    await connection.beginTransaction();
    for (const [key, value] of Object.entries(updates)) {
      const [result] = await connection.query('UPDATE app_settings SET setting_value = ? WHERE setting_key = ?', [String(value), key]);
      if (result.affectedRows === 0) {
        await connection.query('INSERT INTO app_settings (setting_key, setting_value) VALUES (?, ?)', [key, String(value)]);
      }
    }
    await connection.commit();
    res.json({ ok: true });
  } catch (error) {
    await connection.rollback();
    console.error(error);
    res.status(500).json({ error: 'Failed to update settings' });
  } finally {
    connection.release();
  }
});

app.use(express.static(process.cwd()));

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
