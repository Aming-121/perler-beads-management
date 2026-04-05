import { useState } from 'react';
import { InventoryItem } from '../types';
import OperationModal from './OperationModal';

interface Props {
  inventory: Map<string, InventoryItem>;
  onUpdate: (series: string, number: number, delta: number) => void;
  searchQuery?: string;
}

const SERIES_LIST = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'M'];

export default function InventoryList({ inventory, onUpdate, searchQuery }: Props) {
  const [expandedSeries, setExpandedSeries] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);

  // Filter series based on search query
  const filteredSeries = searchQuery
    ? SERIES_LIST.filter(s => {
        const item = inventory.get(`${s}${searchQuery}`);
        if (item) return true;
        for (let n = 1; n <= 35; n++) {
          const key = `${s}${n}`;
          if (inventory.get(key) && key.toLowerCase().includes(searchQuery.toLowerCase())) {
            return true;
          }
        }
        return false;
      })
    : SERIES_LIST;

  // Get items for a series
  const getSeriesItems = (series: string): InventoryItem[] => {
    const items: InventoryItem[] = [];
    for (let n = 1; n <= 35; n++) {
      const key = `${series}${n}`;
      const item = inventory.get(key);
      // 显示所有已存在的项目，包括数量为0的
      if (item) {
        items.push(item);
      }
    }
    return items;
  };

  // Filter items within a series based on search
  const getFilteredItems = (series: string): InventoryItem[] => {
    const items = getSeriesItems(series);
    if (!searchQuery) return items;
    return items.filter(item => {
      const name = `${item.series}${item.number}`;
      return name.toLowerCase().includes(searchQuery.toLowerCase());
    });
  };

  const handleOperation = (item: InventoryItem, delta: number) => {
    onUpdate(item.series, item.number, delta);
  };

  return (
    <div style={{ padding: '0 20px' }}>
      {/* Series Grid */}
      <div className="series-grid">
        {filteredSeries.map(series => {
          const items = getSeriesItems(series);
          const count = items.length;
          const isActive = expandedSeries === series;

          return (
            <div
              key={series}
              className={`series-card ${isActive ? 'active' : ''}`}
              onClick={() => setExpandedSeries(isActive ? null : series)}
            >
              <span className="series-letter">{series}</span>
              <span className="series-count">{count} 种</span>
            </div>
          );
        })}
      </div>

      {/* Expanded Series Items */}
      {expandedSeries && (
        <div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 20px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
            }}
          >
            <span style={{ fontWeight: 600, color: 'white' }}>
              {expandedSeries} 系列详情
            </span>
            <button
              onClick={() => setExpandedSeries(null)}
              style={{
                background: 'rgba(255,255,255,0.2)',
                border: 'none',
                padding: '4px 10px',
                borderRadius: '6px',
                color: 'white',
                fontWeight: 500,
                cursor: 'pointer',
                fontSize: '13px'
              }}
            >
              收起
            </button>
          </div>
          <div className="items-grid">
            {getFilteredItems(expandedSeries).map(item => (
              <div
                key={`${item.series}${item.number}`}
                className={`item-card ${item.quantity === 0 ? 'zero' : ''}`}
                onClick={() => setSelectedItem(item)}
              >
                <div className="item-name">
                  {item.series}{item.number}
                </div>
                <div className={`item-qty ${item.quantity === 0 ? 'zero' : item.quantity < 5 ? 'low' : ''}`}>
                  {item.quantity === 0 ? '缺货' : item.quantity}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {filteredSeries.length === 0 && (
        <div className="empty-state">
          <svg className="empty-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <div className="empty-text">未找到匹配的库存</div>
        </div>
      )}

      {/* Operation Modal */}
      {selectedItem && (
        <OperationModal
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          onAdd={() => {
            handleOperation(selectedItem, 1);
            setSelectedItem(null);
          }}
          onSubtract={() => {
            handleOperation(selectedItem, -1);
            setSelectedItem(null);
          }}
          onCustom={(delta) => {
            handleOperation(selectedItem, delta);
            setSelectedItem(null);
          }}
        />
      )}
    </div>
  );
}
