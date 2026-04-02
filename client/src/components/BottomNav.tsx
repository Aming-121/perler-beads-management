interface Props {
  active: 'inventory' | 'query';
  onChange: (tab: 'inventory' | 'query') => void;
}

export default function BottomNav({ active, onChange }: Props) {
  return (
    <nav className="bottom-nav">
      <div
        className={`nav-item ${active === 'inventory' ? 'active' : ''}`}
        onClick={() => onChange('inventory')}
      >
        <svg className="nav-item-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
        <span className="nav-item-label">库存</span>
      </div>
      <div
        className={`nav-item ${active === 'query' ? 'active' : ''}`}
        onClick={() => onChange('query')}
      >
        <svg className="nav-item-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
        <span className="nav-item-label">查询</span>
      </div>
    </nav>
  );
}
