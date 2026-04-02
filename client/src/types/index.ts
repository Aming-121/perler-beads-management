// 库存项
export interface InventoryItem {
  series: string;      // A-H, M
  number: number;       // 1-31
  quantity: number;     // 数量
}

// 交易记录
export interface Transaction {
  id: string;
  series: string;
  number: number;
  type: 'in' | 'out';
  quantity: number;
  timestamp: string;
}

// 豆号系列
export const BEAD_SERIES = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'M'] as const;
export type BeadSeries = typeof BEAD_SERIES[number];

// 系列列表（用于选择器）
export const SERIES_OPTIONS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'M'];

// 所有可选序号
export const NUMBER_OPTIONS = Array.from({ length: 31 }, (_, i) => i + 1);
