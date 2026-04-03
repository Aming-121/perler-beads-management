import pg from 'pg';

const { Pool } = pg;

// Vercel 环境使用 DATABASE_URL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:eIZSF0oWUD7h59JK@db.wysxndhhqwirsdgubjmv.supabase.co:5432/postgres?sslmode=require',
  ssl: { rejectUnauthorized: false },
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on('connect', () => {
  console.log('✅ 数据库连接成功');
});

pool.on('error', (err) => {
  console.error('❌ 数据库连接错误:', err);
});

// 测试连接
pool.query('SELECT NOW()')
  .then(() => console.log('✅ 数据库连接测试成功'))
  .catch(err => console.error('❌ 数据库连接测试失败:', err.message));

export default pool;
