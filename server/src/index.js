import express from 'express';
import cors from 'cors';
import pool from './db/connection.js';

const app = express();

app.use(cors({
  origin: ['https://aming030121.top', 'https://perler-beads-management-client.vercel.app'],
  credentials: true
}));
app.use(express.json());

// 健康检查
app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', database: 'connected' });
  } catch (error) {
    console.error('DB Error:', error.message);
    res.status(500).json({ status: 'error', database: 'disconnected', error: error.message });
  }
});

// 获取所有库存
app.get('/api/inventory', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT series, number, quantity FROM inventory ORDER BY series, number'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('获取库存失败:', error);
    res.status(500).json({ error: '获取库存失败' });
  }
});

// 按系列获取库存
app.get('/api/inventory/series/:series', async (req, res) => {
  try {
    const { series } = req.params;
    const result = await pool.query(
      'SELECT series, number, quantity FROM inventory WHERE series = $1 AND quantity > 0 ORDER BY number',
      [series.toUpperCase()]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: '获取库存失败' });
  }
});

// 获取单个库存项
app.get('/api/inventory/:series/:number', async (req, res) => {
  try {
    const { series, number } = req.params;
    const result = await pool.query(
      'SELECT series, number, quantity FROM inventory WHERE series = $1 AND number = $2',
      [series.toUpperCase(), parseInt(number)]
    );
    
    if (result.rows.length === 0) {
      return res.json({ series: series.toUpperCase(), number: parseInt(number), quantity: 0 });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: '获取库存项失败' });
  }
});

// 添加或更新库存
app.post('/api/inventory', async (req, res) => {
  try {
    const { series, number, quantity, type = 'in' } = req.body;

    if (!series || !number || !quantity) {
      return res.status(400).json({ error: '缺少必要参数' });
    }

    const upperSeries = series.toUpperCase();
    const num = parseInt(number);
    const qty = parseInt(quantity);

    const result = await pool.query(
      `INSERT INTO inventory (series, number, quantity, updated_at)
       VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
       ON CONFLICT (series, number)
       DO UPDATE SET 
         quantity = inventory.quantity + EXCLUDED.quantity,
         updated_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [upperSeries, num, qty]
    );

    await pool.query(
      `INSERT INTO transactions (series, number, type, quantity)
       VALUES ($1, $2, $3, $4)`,
      [upperSeries, num, type, qty]
    );

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('添加库存失败:', error);
    res.status(500).json({ error: '添加库存失败' });
  }
});

// 更新库存数量
app.patch('/api/inventory/:series/:number', async (req, res) => {
  try {
    const { series, number } = req.params;
    const { delta, type } = req.body;

    if (delta === undefined) {
      return res.status(400).json({ error: '缺少 delta 参数' });
    }

    const upperSeries = series.toUpperCase();
    const num = parseInt(number);
    const d = parseInt(delta);
    const transactionType = type || (d > 0 ? 'in' : 'out');

    const current = await pool.query(
      'SELECT quantity FROM inventory WHERE series = $1 AND number = $2',
      [upperSeries, num]
    );

    const currentQty = current.rows.length > 0 ? current.rows[0].quantity : 0;
    const newQty = Math.max(0, currentQty + d);

    if (current.rows.length === 0) {
      await pool.query(
        `INSERT INTO inventory (series, number, quantity) VALUES ($1, $2, $3)`,
        [upperSeries, num, newQty]
      );
    } else {
      await pool.query(
        `UPDATE inventory SET quantity = $1, updated_at = CURRENT_TIMESTAMP 
         WHERE series = $2 AND number = $3`,
        [newQty, upperSeries, num]
      );
    }

    await pool.query(
      `INSERT INTO transactions (series, number, type, quantity)
       VALUES ($1, $2, $3, $4)`,
      [upperSeries, num, transactionType, Math.abs(d)]
    );

    res.json({ success: true, data: { series: upperSeries, number: num, quantity: newQty } });
  } catch (error) {
    console.error('更新库存失败:', error);
    res.status(500).json({ error: '更新库存失败' });
  }
});

// 获取所有交易记录
app.get('/api/transactions', async (req, res) => {
  try {
    const { series, number, limit = 100, offset = 0 } = req.query;
    
    let query = 'SELECT * FROM transactions WHERE 1=1';
    let countQuery = 'SELECT COUNT(*) FROM transactions WHERE 1=1';
    const params = [];
    const countParams = [];
    let paramIndex = 1;

    if (series) {
      query += ` AND series = $${paramIndex}`;
      countQuery += ` AND series = $${paramIndex}`;
      params.push(series);
      countParams.push(series);
      paramIndex++;
    }

    if (number) {
      query += ` AND number = $${paramIndex}`;
      countQuery += ` AND number = $${paramIndex}`;
      params.push(parseInt(number));
      countParams.push(parseInt(number));
      paramIndex++;
    }

    query += ` ORDER BY timestamp DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(parseInt(limit), parseInt(offset));

    const [dataResult, countResult] = await Promise.all([
      pool.query(query, params),
      pool.query(countQuery, countParams)
    ]);

    res.json({
      data: dataResult.rows,
      total: parseInt(countResult.rows[0].count),
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (error) {
    console.error('获取交易记录失败:', error);
    res.status(500).json({ error: '获取交易记录失败' });
  }
});

// 获取单个库存的交易记录
app.get('/api/transactions/:series/:number', async (req, res) => {
  try {
    const { series, number } = req.params;
    const result = await pool.query(
      `SELECT * FROM transactions WHERE series = $1 AND number = $2 ORDER BY timestamp DESC LIMIT 50`,
      [series.toUpperCase(), parseInt(number)]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('获取交易记录失败:', error);
    res.status(500).json({ error: '获取交易记录失败' });
  }
});

export default app;
