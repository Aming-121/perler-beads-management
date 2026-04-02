import { useState } from 'react';
import SearchBar from '../components/SearchBar';
import InventoryList from '../components/InventoryList';
import AddModal from '../components/AddModal';
import { InventoryItem, Transaction } from '../types';
import { inventoryApi } from '../services/api';

interface Props {
  inventory: Map<string, InventoryItem>;
  transactions: Transaction[];
  onUpdateInventory: (series: string, number: number, delta: number) => void;
  onAddTransaction: (t: Transaction) => void;
}

export default function Inventory({
  inventory,
  onUpdateInventory,
}: Props) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [adding, setAdding] = useState(false);

  // 计算总库存
  const totalItems = Array.from(inventory.values()).filter(item => item.quantity > 0).length;
  const totalQuantity = Array.from(inventory.values()).reduce((sum, item) => sum + item.quantity, 0);

  const handleAddItem = async (series: string, number: number, quantity: number) => {
    try {
      setAdding(true);
      await inventoryApi.add(series, number, quantity);
      // 触发父组件刷新数据
      window.dispatchEvent(new CustomEvent('refreshData'));
    } catch (err) {
      console.error('添加失败:', err);
    } finally {
      setAdding(false);
      setShowAddModal(false);
    }
  };

  return (
    <div>
      {/* Header - 渐变标题栏 */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '20px',
        paddingBottom: '24px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{
              fontSize: '24px',
              fontWeight: 700,
              color: 'white',
              margin: 0,
              marginBottom: '8px'
            }}>库存管理</h1>
            <div style={{ display: 'flex', gap: '16px', fontSize: '13px', color: 'rgba(255,255,255,0.85)' }}>
              <span>📦 {totalItems} 种色号</span>
              <span>✨ {totalQuantity} 总量</span>
            </div>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '14px',
              background: 'rgba(255,255,255,0.2)',
              backdropFilter: 'blur(10px)',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
            }}
          >
            <svg width="24" height="24" fill="none" stroke="white" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
      </div>

      {/* Search */}
      <SearchBar
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder="搜索豆号，如 A1"
      />

      {/* Inventory List */}
      <InventoryList
        inventory={inventory}
        onUpdate={onUpdateInventory}
        searchQuery={searchQuery}
      />

      {/* Add Modal */}
      {showAddModal && (
        <AddModal
          onClose={() => setShowAddModal(false)}
          onAdd={handleAddItem}
        />
      )}
    </div>
  );
}
