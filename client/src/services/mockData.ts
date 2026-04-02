import { InventoryItem, Transaction, BEAD_SERIES } from '../types';

// 生成随机ID
const generateId = () => Math.random().toString(36).substring(2, 15);

// 生成随机库存数据
const generateMockInventory = (): InventoryItem[] => {
  const inventory: InventoryItem[] = [];
  BEAD_SERIES.forEach(series => {
    // 每个系列随机有 5-15 个色号
    const count = Math.floor(Math.random() * 11) + 5;
    const usedNumbers = new Set<number>();
    
    while (usedNumbers.size < count) {
      const number = Math.floor(Math.random() * 31) + 1;
      if (!usedNumbers.has(number)) {
        usedNumbers.add(number);
        inventory.push({
          series,
          number,
          quantity: Math.floor(Math.random() * 100) + 1
        });
      }
    }
  });
  return inventory;
};

// 生成随机交易记录
const generateMockTransactions = (inventory: InventoryItem[]): Transaction[] => {
  const transactions: Transaction[] = [];
  const now = new Date();
  
  inventory.forEach(item => {
    // 为每个库存项生成 1-3 条交易记录
    const count = Math.floor(Math.random() * 3) + 1;
    
    for (let i = 0; i < count; i++) {
      const daysAgo = Math.floor(Math.random() * 30);
      const date = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
      const type = Math.random() > 0.4 ? 'in' : 'out';
      
      transactions.push({
        id: generateId(),
        series: item.series,
        number: item.number,
        type,
        quantity: Math.floor(Math.random() * 20) + 1,
        timestamp: date.toISOString()
      });
    }
  });
  
  // 按时间排序
  return transactions.sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
};

// 初始数据
let mockInventory = generateMockInventory();
let mockTransactions = generateMockTransactions(mockInventory);

// 库存服务
export const inventoryService = {
  // 获取所有库存
  getAll: (): InventoryItem[] => [...mockInventory],
  
  // 按系列获取库存
  getBySeries: (series: string): InventoryItem[] => 
    mockInventory.filter(item => item.series === series),
  
  // 获取单个库存项
  getItem: (series: string, number: number): InventoryItem | undefined =>
    mockInventory.find(item => item.series === series && item.number === number),
  
  // 添加库存
  add: (series: string, number: number, quantity: number): InventoryItem => {
    const existing = mockInventory.find(
      item => item.series === series && item.number === number
    );
    
    if (existing) {
      existing.quantity += quantity;
      return existing;
    }
    
    const newItem: InventoryItem = { series, number, quantity };
    mockInventory.push(newItem);
    
    // 添加入库记录
    const transaction: Transaction = {
      id: generateId(),
      series,
      number,
      type: 'in',
      quantity,
      timestamp: new Date().toISOString()
    };
    mockTransactions.unshift(transaction);
    
    return newItem;
  },
  
  // 更新库存数量
  updateQuantity: (series: string, number: number, delta: number): InventoryItem | null => {
    const item = mockInventory.find(
      i => i.series === series && i.number === number
    );
    
    if (!item) return null;
    
    item.quantity = Math.max(0, item.quantity + delta);
    
    // 添加交易记录
    const transaction: Transaction = {
      id: generateId(),
      series,
      number,
      type: delta > 0 ? 'in' : 'out',
      quantity: Math.abs(delta),
      timestamp: new Date().toISOString()
    };
    mockTransactions.unshift(transaction);
    
    return item;
  },
  
  // 搜索库存
  search: (series?: string, number?: number): InventoryItem[] => {
    return mockInventory.filter(item => {
      if (series && item.series !== series) return false;
      if (number && item.number !== number) return false;
      return true;
    });
  }
};

// 交易记录服务
export const transactionService = {
  // 获取所有交易记录
  getAll: (): Transaction[] => [...mockTransactions],

  // 按条件筛选
  filter: (series?: string, number?: number): Transaction[] => {
    return mockTransactions.filter(t => {
      if (series && t.series !== series) return false;
      if (number && t.number !== number) return false;
      return true;
    });
  }
};

// 导出初始化函数（用于 App.tsx 初始化）
export const getMockInventory = (): Map<string, InventoryItem> => {
  const map = new Map<string, InventoryItem>();
  mockInventory.forEach(item => {
    map.set(`${item.series}${item.number}`, item);
  });
  return map;
};

export const getMockTransactions = (): Transaction[] => [...mockTransactions];
