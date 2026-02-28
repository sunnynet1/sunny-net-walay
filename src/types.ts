export interface Customer {
  id?: number;
  username: string;
  full_name: string;
  status: string;
  package: string;
  bandwidth: string;
  expiry_date: string;
  area: string;
  address?: string;
  mobile_number?: string;
  pending_balance?: number;
}

export interface BandwidthStat {
  count: number;
  profit: number;
  companyPayable: number;
  paid: number;
  pending: number;
}

export interface DashboardStats {
  totalActive: number;
  totalTerminated: number;
  bandwidthStats: Record<string, BandwidthStat>;
  areaStats: Record<string, number>;
  totalProfit: number;
  totalCompanyPayable: number;
  totalCollected: number;
  paidProfit: number;
  pendingProfit: number;
  paidCount: number;
  pendingCount: number;
  totalPendingBalance: number;
}

export const PRICING = {
  "12 MB": { company: 485, my: 1200 },
  "17 MB": { company: 535, my: 1400 },
  "22 MB": { company: 625, my: 1800 },
  "27 MB": { company: 710, my: 2500 },
  "32 MB": { company: 810, my: 3500 },
  "52 MB": { company: 1950, my: 5000 },
};
