import express from 'express';
import pool from '../db/connection.js';

const router = express.Router();

// 获取所有库存
router.get('/', async (req, res) => {
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
router.get('/series/:series', async (req, res) => {
  try {
    const { series } = req.params;
    const result = await pool.query(
      'SELECT series, number, quantity FROM inventory WHERE series = $1 AND quantity > 0 ORDER BY number',
      [series.toUpperCase()]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('获取库存失败:', error);
    res.status(500).json({ error: '获取库存失败' });
  }
});

// 获取单个库存项
router.get('/:series/:number', async (req, res) => {
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
    console.error('获取库存项失败:', error);
    res.status(500).json({ error: '获取库存项失败' });
  }
});

// 添加或更新库存
router.post('/', async (req, res) => {
  try {
    const { series, number, quantity, type = 'in' } = req.body;

    if (!series || !number || !quantity) {
      return res.status(400).json({ error: '缺少必要参数' });
    }

    const upperSeries = series.toUpperCase();
    const num = parseInt(number);
    const qty = parseInt(quantity);

    // 使用 UPSERT: 如果存在则更新，不存在则插入
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

    // 添加入库记录
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

// 更新库存数量（增加或减少）
router.patch('/:series/:number', async (req, res) => {
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

    // 先获取当前库存
    const current = await pool.query(
      'SELECT quantity FROM inventory WHERE series = $1 AND number = $2',
      [upperSeries, num]
    );

    const currentQty = current.rows.length > 0 ? current.rows[0].quantity : 0;
    const newQty = Math.max(0, currentQty + d);

    if (current.rows.length === 0) {
      // 不存在则创建
      await pool.query(
        `INSERT INTO inventory (series, number, quantity) VALUES ($1, $2, $3)`,
        [upperSeries, num, newQty]
      );
    } else {
      // 更新库存
      await pool.query(
        `UPDATE inventory SET quantity = $1, updated_at = CURRENT_TIMESTAMP 
         WHERE series = $2 AND number = $3`,
        [newQty, upperSeries, num]
      );
    }

    // 添加入库/出库记录
    await pool.query(
      `INSERT INTO transactions (series, number, type, quantity)
       VALUES ($1, $2, $3, $4)`,
      [upperSeries, num, transactionType, Math.abs(d)]
    );

    res.json({ 
      success: true, 
      data: { series: upperSeries, number: num, quantity: newQty }
    });
  } catch (error) {
    console.error('更新库存失败:', error);
    res.status(500).json({ error: '更新库存失败' });
  }
});

export default router;
