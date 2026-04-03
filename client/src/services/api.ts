import { InventoryItem, Transaction } from '../types';

// Vercel 部署时使用后端地址
const API_BASE = 'https://perler-beads-management-server.vercel.app/api';

// 类型定义
interface ApiResponse<T> {
  data: T;
  success?: boolean;
}

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  limit: number;
  offset: number;
}

// 库存 API
export const inventoryApi = {
  // 获取所有库存
  getAll: async (): Promise<Map<string, InventoryItem>> => {
    const res = await fetch(`${API_BASE}/inventory`);
    const data = await res.json();
    const map = new Map<string, InventoryItem>();
    if (Array.isArray(data)) {
      data.forEach((item: InventoryItem) => {
        map.set(`${item.series}${item.number}`, item);
      });
    }
    return map;
  },

  // 按系列获取库存
  getBySeries: async (series: string): Promise<InventoryItem[]> => {
    const res = await fetch(`${API_BASE}/inventory/series/${series}`);
    return res.json();
  },

  // 获取单个库存项
  getItem: async (series: string, number: number): Promise<InventoryItem> => {
    const res = await fetch(`${API_BASE}/inventory/${series}/${number}`);
    return res.json();
  },

  // 添加库存
  add: async (series: string, number: number, quantity: number): Promise<InventoryItem> => {
    const res = await fetch(`${API_BASE}/inventory`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ series, number, quantity, type: 'in' })
    });
    const data = await res.json();
    return data.data;
  },

  // 更新库存数量
  update: async (series: string, number: number, delta: number): Promise<InventoryItem> => {
    const res = await fetch(`${API_BASE}/inventory/${series}/${number}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ delta })
    });
    const data = await res.json();
    return data.data;
  }
};

// 交易记录 API
export const transactionApi = {
// 获取所有交易记录
getAll: async (params?: {
    series?: string;
    number?: number;
    limit?: number;
    offset?: number;
  }): Promise<PaginatedResponse<Transaction>> => {
    const searchParams = new URLSearchParams();
    if (params?.series) searchParams.set('series', params.series);
    if (params?.number) searchParams.set('number', String(params.number));
    if (params?.limit) searchParams.set('limit', String(params.limit));
    if (params?.offset) searchParams.set('offset', String(params.offset));
    
    const res = await fetch(`${API_BASE}/transactions?${searchParams}`);
    if (!res.ok) {
      console.error('API Error:', res.status);
      return { data: [], total: 0, limit: 100, offset: 0 };
    }
    return res.json();
  },

  // 获取单个库存的操作记录
  getByItem: async (series: string, number: number): Promise<Transaction[]> => {
    const res = await fetch(`${API_BASE}/transactions/${series}/${number}`);
    return res.json();
  }
};
