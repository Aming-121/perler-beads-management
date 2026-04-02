-- 拼豆库存管理系统数据库初始化脚本 (PostgreSQL)

-- 创建库存表
CREATE TABLE IF NOT EXISTS inventory (
    id SERIAL PRIMARY KEY,
    series VARCHAR(1) NOT NULL,
    number INT NOT NULL CHECK (number >= 1 AND number <= 31),
    quantity INT NOT NULL DEFAULT 0,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(series, number)
);

-- 创建交易记录表
CREATE TABLE IF NOT EXISTS transactions (
    id BIGSERIAL PRIMARY KEY,
    series VARCHAR(1) NOT NULL,
    number INT NOT NULL,
    type VARCHAR(3) NOT NULL CHECK (type IN ('in', 'out')),
    quantity INT NOT NULL CHECK (quantity > 0),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_inventory_series ON inventory(series);
CREATE INDEX IF NOT EXISTS idx_transactions_series ON transactions(series);
CREATE INDEX IF NOT EXISTS idx_transactions_number ON transactions(number);
CREATE INDEX IF NOT EXISTS idx_transactions_timestamp ON transactions(timestamp DESC);

-- 初始化一些示例数据
INSERT INTO inventory (series, number, quantity) VALUES
    ('A', 1, 50),
    ('A', 5, 30),
    ('A', 12, 25),
    ('B', 3, 40),
    ('B', 8, 15),
    ('C', 2, 60),
    ('C', 7, 45),
    ('C', 15, 20),
    ('D', 1, 35),
    ('E', 4, 28),
    ('F', 6, 42),
    ('G', 9, 18),
    ('H', 2, 55),
    ('M', 1, 100)
ON CONFLICT (series, number) DO NOTHING;
