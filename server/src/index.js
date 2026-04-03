import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import pool from './db/connection.js';
import inventoryRoutes from './routes/inventory.js';
import transactionsRoutes from './routes/transactions.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(express.json());

// 请求日志
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
  next();
});

// 静态文件服务（生产环境）
const clientDistPath = path.join(__dirname, '../../client/dist');
app.use(express.static(clientDistPath));

// API 路由
app.use('/api/inventory', inventoryRoutes);
app.use('/api/transactions', transactionsRoutes);

// 健康检查
app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', database: 'connected', timestamp: new Date().toISOString() });
  } catch (error) {
    res.status(500).json({ status: 'error', database: 'disconnected', error: error.message });
  }
});

// SPA 路由支持 - 所有未匹配的路由返回 index.html
app.get('*', (req, res) => {
  const indexPath = path.join(clientDistPath, 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) {
      res.status(200).send(`
        <!DOCTYPE html>
        <html>
        <head><title>拼豆库存管理</title></head>
        <body>
          <h1>拼豆库存管理系统</h1>
          <p>后端服务运行正常，请先构建前端：</p>
          <pre>cd client && npm install && npm run build</pre>
        </body>
        </html>
      `);
    }
  });
});

// 错误处理
app.use((err, req, res, next) => {
  console.error('服务器错误:', err);
  res.status(500).json({ error: err.message || '服务器内部错误' });
});

// 初始化数据库表
async function initDatabase() {
  try {
    console.log('🔄 正在初始化数据库表...');
    
    // 创建库存表
    await pool.query(`
      CREATE TABLE IF NOT EXISTS inventory (
        id SERIAL PRIMARY KEY,
        series VARCHAR(1) NOT NULL,
        number INT NOT NULL CHECK (number >= 1 AND number <= 35),
        quantity INT NOT NULL DEFAULT 0,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(series, number)
      )
    `);
    console.log('✅ inventory 表已创建');

    // 创建交易记录表
    await pool.query(`
      CREATE TABLE IF NOT EXISTS transactions (
        id BIGSERIAL PRIMARY KEY,
        series VARCHAR(1) NOT NULL,
        number INT NOT NULL,
        type VARCHAR(3) NOT NULL CHECK (type IN ('in', 'out')),
        quantity INT NOT NULL CHECK (quantity > 0),
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ transactions 表已创建');

    // 创建索引
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_inventory_series ON inventory(series)`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_transactions_series ON transactions(series)`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_transactions_timestamp ON transactions(timestamp DESC)`);
    console.log('✅ 索引已创建');

    console.log('✅ 数据库初始化完成');

  } catch (error) {
    console.error('❌ 数据库初始化失败:', error.message);
  }
}

// 启动服务器
app.listen(PORT, async () => {
  console.log(`
╔════════════════════════════════════════════╗
║    拼豆库存管理系统 - 后端服务              ║
╠════════════════════════════════════════════╣
║  📡 服务器地址: http://localhost:${PORT}        ║
║  📦 数据库: ${process.env.DB_HOST}  ║
║  🌐 前端静态文件: ${clientDistPath}  ║
╚════════════════════════════════════════════╝
  `);
  
  // 初始化数据库
  await initDatabase();
  
  console.log('🚀 服务已启动，等待请求...');
});
