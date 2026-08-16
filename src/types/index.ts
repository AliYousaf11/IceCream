export interface User {
  id: string;
  name: string;
  phone: string;
  role?: string;
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface Product {
  id: string;
  name: string;
  quantity: number;
  purchasePrice: number;
  salePrice: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Employee {
  id: string;
  name: string;
  salary: number;
  address?: string;
  phone?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface LedgerEntry {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string;
  shortage: number;
  extra: number;
  recovery: number;
  description: string;
  dispatchId?: string;
  createdAt: string;
}

export interface DispatchItem {
  productId: string;
  productName: string;
  assignedQty: number;
  salePrice: number;
  totalAssignPrice: number;
  returnQty: number;
  totalReturnPrice: number;
  netSoldQty: number;
  netSoldAmount: number;
}

export interface DispatchAssignment {
  id: string;
  date: string;
  employeeId: string;
  employeeName: string;
  items: DispatchItem[];
  totalAssignPrice: number;
  totalReturnPrice: number;
  expectedCash: number;
  cashInHand: number;
  shortageCash: number;
  extraCash: number;
  status: 'DRAFT' | 'SETTLED';
  createdAt: string;
  settledAt?: string;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title?: string;
  message: string;
  duration?: number;
}

export interface ConfirmDialogState {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'primary';
  onConfirm: () => void | Promise<void>;
  onCancel?: () => void;
  isProcessing?: boolean;
}

export type ActiveTab = 'products' | 'employees' | 'dispatch' | 'ledger';
