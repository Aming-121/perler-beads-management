import express from 'express';
import pool from '../db/connection.js';

const router = express.Router();

// 获取所有交易记录
router.get('/', async (req, res) => {
  try {
    const { series, number, limit = 100, offset = 0 } = req.query;
    
    let query = 'SELECT * FROM transactions WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    if (series && series !== '全部') {
      query += ` AND series = $${paramIndex}`;
      params.push(series.toUpperCase());
      paramIndex++;
    }

    if (number) {
      query += ` AND number = $${paramIndex}`;
      params.push(parseInt(number));
      paramIndex++;
    }

    query += ` ORDER BY timestamp DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(parseInt(limit), parseInt(offset));

    const result = await pool.query(query, params);

    // 获取总数
    let countQuery = 'SELECT COUNT(*) FROM transactions WHERE 1=1';
    const countParams = [];
    let countIndex = 1;

    if (series && series !== '全部') {
      countQuery += ` AND series = $${countIndex}`;
      countParams.push(series.toUpperCase());
      countIndex++;
    }

    if (number) {
      countQuery += ` AND number = $${countIndex}`;
      countParams.push(parseInt(number));
    }

    const countResult = await pool.query(countQuery, countParams);

    res.json({
      data: result.rows,
      total: parseInt(countResult.rows[0].count),
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (error) {
    console.error('获取交易记录失败:', error);
    res.status(500).json({ error: '获取交易记录失败' });
  }
});

// 获取单个库存的操作记录
router.get('/:series/:number', async (req, res) => {
  try {
    const { series, number } = req.params;
    const { limit = 50 } = req.query;

    const result = await pool.query(
      `SELECT * FROM transactions 
       WHERE series = $1 AND number = $2 
       ORDER BY timestamp DESC 
       LIMIT $3`,
      [series.toUpperCase(), parseInt(number), parseInt(limit)]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('获取操作记录失败:', error);
    res.status(500).json({ error: '获取操作记录失败' });
  }
});

export default router;
