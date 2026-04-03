import { useState } from 'react';
import SearchBar from '../components/SearchBar';
import { Transaction } from '../types';

interface Props {
  transactions: Transaction[];
}

const SERIES_LIST = ['全部', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'M'];

// 格式化日期（使用北京时间）
const formatDate = (isoString: string) => {
  const date = new Date(isoString);
  return date.toLocaleString('zh-CN', {
    timeZone: 'Asia/Shanghai',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// 格式化完整日期（用于统计，使用北京时间）
const formatFullDate = (isoString: string) => {
  const date = new Date(isoString);
  return date.toLocaleDateString('zh-CN', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export default function Query({ transactions }: Props) {
  const [filterSeries, setFilterSeries] = useState('全部');
  const [filterNumber, setFilterNumber] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // 日期格式化函数（返回 YYYY-MM-DD 格式）
  const formatToDateString = (isoString: string) => {
    const date = new Date(isoString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Filter transactions
  const filteredTransactions = transactions.filter(t => {
    // 系列筛选
    if (filterSeries !== '全部' && t.series !== filterSeries) return false;
    // 序号筛选
    if (filterNumber && t.number !== parseInt(filterNumber)) return false;
    // 日期筛选
    if (filterDate) {
      const txDate = formatToDateString(t.timestamp);
      if (txDate !== filterDate) return false;
    }
    // 搜索筛选
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const name = `${t.series}${t.number}`;
      if (!name.toLowerCase().includes(query)) return false;
    }
    return true;
  }).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  // 统计数据
  const totalIn = filteredTransactions.filter(t => t.type === 'in').reduce((sum, t) => sum + t.quantity, 0);
  const totalOut = filteredTransactions.filter(t => t.type === 'out').reduce((sum, t) => sum + t.quantity, 0);
  const totalRecords = filteredTransactions.length;

  return (
    <div>
      {/* Header */}
      <div className="page-header" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <h1 className="page-title" style={{ color: 'white' }}>操作记录</h1>
      </div>

      {/* 统计卡片 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '12px',
        padding: '16px 20px',
        background: 'linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)'
      }}>
        <div style={{
          background: 'white',
          borderRadius: '14px',
          padding: '14px',
          textAlign: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
        }}>
          <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>总记录</div>
          <div style={{ fontSize: '22px', fontWeight: 700, color: '#6366f1' }}>{totalRecords}</div>
        </div>
        <div style={{
          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          borderRadius: '14px',
          padding: '14px',
          textAlign: 'center',
          boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
        }}>
          <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.8)', marginBottom: '4px' }}>入库</div>
          <div style={{ fontSize: '22px', fontWeight: 700, color: 'white' }}>+{totalIn}</div>
        </div>
        <div style={{
          background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
          borderRadius: '14px',
          padding: '14px',
          textAlign: 'center',
          boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)'
        }}>
          <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.8)', marginBottom: '4px' }}>出库</div>
          <div style={{ fontSize: '22px', fontWeight: 700, color: 'white' }}>-{totalOut}</div>
        </div>
      </div>

      {/* 搜索框 */}
      <SearchBar
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder="搜索豆号，如 A1"
      />

      {/* 筛选栏 */}
      <div className="query-container" style={{ paddingTop: '0' }}>
        <div className="filter-bar">
          <div className="filter-row">
            <select
              className="filter-select"
              value={filterSeries}
              onChange={e => setFilterSeries(e.target.value)}
            >
              {SERIES_LIST.map(s => (
                <option key={s} value={s}>{s === '全部' ? '全部系列' : `${s} 系列`}</option>
              ))}
            </select>
            <select
              className="filter-select"
              value={filterNumber}
              onChange={e => setFilterNumber(e.target.value)}
            >
              <option value="">全部序号</option>
              {Array.from({ length: 35 }, (_, i) => i + 1).map(n => (
                <option key={n} value={n}>序号 {n}</option>
              ))}
            </select>
          </div>
          {/* 日期筛选 */}
          <div className="filter-row" style={{ marginTop: '8px' }}>
            <input
              type="date"
              className="filter-select"
              value={filterDate}
              onChange={e => setFilterDate(e.target.value)}
              style={{ flex: 1, color: filterDate ? '#1f2937' : '#9ca3af' }}
            />
            {filterDate && (
              <button
                onClick={() => setFilterDate('')}
                style={{
                  padding: '8px 12px',
                  background: '#f3f4f6',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '12px',
                  color: '#6b7280',
                  cursor: 'pointer'
                }}
              >
                清除日期
              </button>
            )}
          </div>
        </div>

        {/* 记录列表 */}
        {filteredTransactions.length > 0 ? (
          <div className="table-container">
            {filteredTransactions.map((t, index) => (
              <div
                key={t.id}
                className="table-row"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '14px 16px',
                  borderBottom: index < filteredTransactions.length - 1 ? '1px solid #f3f4f6' : 'none'
                }}
              >
                {/* 左侧：类型标识 */}
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '12px',
                  background: t.type === 'in'
                    ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                    : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: '12px',
                  boxShadow: t.type === 'in'
                    ? '0 4px 10px rgba(16, 185, 129, 0.3)'
                    : '0 4px 10px rgba(239, 68, 68, 0.3)'
                }}>
                  {t.type === 'in' ? (
                    <svg width="20" height="20" fill="none" stroke="white" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                    </svg>
                  ) : (
                    <svg width="20" height="20" fill="none" stroke="white" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M20 12H4" />
                    </svg>
                  )}
                </div>

                {/* 中间：信息 */}
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                    <span style={{
                      fontSize: '16px',
                      fontWeight: 700,
                      color: '#1f2937',
                      background: '#f3f4f6',
                      padding: '2px 8px',
                      borderRadius: '6px'
                    }}>
                      {t.series}{t.number}
                    </span>
                    <span style={{
                      fontSize: '12px',
                      fontWeight: 600,
                      color: t.type === 'in' ? '#10b981' : '#ef4444'
                    }}>
                      {t.type === 'in' ? '入库' : '出库'}
                    </span>
                  </div>
                  <div style={{ fontSize: '12px', color: '#9ca3af' }}>
                    {formatFullDate(t.timestamp)}
                  </div>
                </div>

                {/* 右侧：数量 */}
                <div style={{
                  fontSize: '20px',
                  fontWeight: 700,
                  color: t.type === 'in' ? '#10b981' : '#ef4444'
                }}>
                  {t.type === 'in' ? '+' : '-'}{t.quantity}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state" style={{ background: 'white', borderRadius: '16px', marginTop: '0' }}>
            <svg className="empty-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <div className="empty-text">暂无记录</div>
          </div>
        )}
      </div>
    </div>
  );
}
