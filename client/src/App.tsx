import { useState, useEffect } from 'react';
import Inventory from './pages/Inventory';
import Query from './pages/Query';
import BottomNav from './components/BottomNav';
import { InventoryItem, Transaction } from './types';
import { inventoryApi, transactionApi } from './services/api';

type Tab = 'inventory' | 'query';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('inventory');
  const [inventory, setInventory] = useState<Map<string, InventoryItem>>(new Map());
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // 加载初始数据
  useEffect(() => {
    loadData();

    // 监听数据刷新事件
    const handleRefresh = () => loadData();
    window.addEventListener('refreshData', handleRefresh);
    
    // 监听 Toast 提示事件
    const handleShowToast = (e: CustomEvent) => {
      showToast(e.detail.message, e.detail.type);
    };
    window.addEventListener('showToast', handleShowToast as EventListener);
    
    return () => {
      window.removeEventListener('refreshData', handleRefresh);
      window.removeEventListener('showToast', handleShowToast as EventListener);
    };
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [inventoryData, transactionsData] = await Promise.all([
        inventoryApi.getAll(),
        transactionApi.getAll({ limit: 100 })
      ]);
      
      setInventory(inventoryData);
      setTransactions(transactionsData.data);
    } catch (err) {
      console.error('加载数据失败:', err);
      setError('加载数据失败，请检查后端服务是否启动');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 2500);
  };

  const handleUpdateInventory = async (series: string, number: number, delta: number) => {
    try {
      const updated = await inventoryApi.update(series, number, delta);
      setInventory(prev => {
        const newMap = new Map(prev);
        newMap.set(`${series}${number}`, updated);
        return newMap;
      });
      showToast(delta > 0 ? `${series}${number} 已入库 +${delta}` : `${series}${number} 已出库 -${Math.abs(delta)}`);
      
      // 刷新交易记录
      const transactionsData = await transactionApi.getAll({ limit: 100 });
      setTransactions(transactionsData.data);
    } catch (err) {
      console.error('更新库存失败:', err);
      showToast('操作失败，请重试', 'error');
    }
  };

  const handleAddTransaction = async (transaction: Transaction) => {
    // 交易记录已在 handleUpdateInventory 中刷新
  };

  if (loading) {
    return (
      <div className="app-container" style={{ justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            width: '40px', 
            height: '40px', 
            border: '4px solid #e5e7eb', 
            borderTopColor: '#6366f1',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <div style={{ color: '#6b7280', fontSize: '14px' }}>加载中...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app-container" style={{ justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
          <div style={{ color: '#ef4444', fontSize: '16px', fontWeight: 600, marginBottom: '8px' }}>
            {error}
          </div>
          <div style={{ color: '#6b7280', fontSize: '14px' }}>
            请确保后端服务已启动并配置正确的数据库连接
          </div>
          <button
            onClick={loadData}
            style={{
              marginTop: '20px',
              padding: '12px 24px',
              background: '#6366f1',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            重试
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <main className="main-content">
        {activeTab === 'inventory' ? (
          <Inventory
            inventory={inventory}
            transactions={transactions}
            onUpdateInventory={handleUpdateInventory}
            onAddTransaction={handleAddTransaction}
          />
        ) : (
          <Query transactions={transactions} />
        )}
      </main>
      <BottomNav active={activeTab} onChange={setActiveTab} />
      
      {/* Toast 弹窗 */}
      {toast && (
        <div style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: toast.type === 'success' ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
          color: 'white',
          padding: '24px 40px',
          borderRadius: '16px',
          fontSize: '18px',
          fontWeight: 600,
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          zIndex: 1000,
          textAlign: 'center',
          animation: 'fadeIn 0.3s ease'
        }}>
          <div style={{ fontSize: '32px', marginBottom: '8px' }}>
            {toast.type === 'success' ? '✓' : '✗'}
          </div>
          {toast.message}
        </div>
      )}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
          to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        }
      `}</style>
    </div>
  );
}
