import { useState, useEffect, useCallback } from 'react';
import { Product, Employee, LedgerEntry, DispatchAssignment } from '../types';
import { api } from '../services/api';

export function useAppData(
  addToast: (msg: string, type?: 'success' | 'error' | 'info') => void,
  userId?: string | null
) {
  const [products, setProducts] = useState<Product[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [ledger, setLedger] = useState<LedgerEntry[]>([]);
  const [dispatches, setDispatches] = useState<DispatchAssignment[]>([]);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isDbConnected, setIsDbConnected] = useState<boolean>(false);
  const [dbInfo, setDbInfo] = useState<{ database: string; mongodb: string }>({
    database: 'Omoor',
    mongodb: 'connected',
  });

  const fetchData = useCallback(async (showLoading = false) => {
    if (showLoading) setIsLoading(true);
    try {
      const [dbState, health] = await Promise.all([
        api.getDbState(),
        api.getHealth().catch(() => ({ status: 'ok', mongodb: 'connected', database: 'Omoor' })),
      ]);

      setProducts(dbState.products || []);
      setEmployees(dbState.employees || []);
      setLedger(dbState.ledger || []);
      setDispatches(dbState.dispatches || []);
      setIsDbConnected(health.mongodb === 'connected');
      setDbInfo({
        database: health.database || 'Omoor',
        mongodb: health.mongodb || 'connected',
      });
    } catch (err: any) {
      console.warn('[useAppData] Fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (userId) {
      fetchData(true);
    } else {
      setProducts([]);
      setEmployees([]);
      setLedger([]);
      setDispatches([]);
      setIsLoading(false);
    }
  }, [userId, fetchData]);

  // Product Actions
  const handleAddProduct = async (productData: Omit<Product, 'id'>) => {
    try {
      const newProduct = await api.createProduct(productData);
      setProducts((prev) => [newProduct, ...prev]);
      addToast(`Added "${newProduct.name}" to inventory.`, 'success');
      return newProduct;
    } catch (err: any) {
      addToast(err.message || 'Failed to add product', 'error');
      throw err;
    }
  };

  const handleUpdateProduct = async (id: string, updates: Partial<Product>) => {
    try {
      const updated = await api.updateProduct(id, updates);
      setProducts((prev) => prev.map((p) => (p.id === id ? updated : p)));
      addToast(`Updated product "${updated.name}".`, 'success');
      return updated;
    } catch (err: any) {
      addToast(err.message || 'Failed to update product', 'error');
      throw err;
    }
  };

  const handleDeleteProduct = async (id: string) => {
    try {
      const target = products.find((p) => p.id === id);
      await api.deleteProduct(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
      addToast(`Deleted product ${target ? `"${target.name}"` : ''}.`, 'success');
    } catch (err: any) {
      addToast(err.message || 'Failed to delete product', 'error');
      throw err;
    }
  };

  // Employee Actions
  const handleAddEmployee = async (employeeData: Omit<Employee, 'id'>) => {
    try {
      const newEmp = await api.createEmployee(employeeData);
      setEmployees((prev) => [newEmp, ...prev]);
      addToast(`Added staff member "${newEmp.name}".`, 'success');
      return newEmp;
    } catch (err: any) {
      addToast(err.message || 'Failed to add employee', 'error');
      throw err;
    }
  };

  const handleUpdateEmployee = async (id: string, updates: Partial<Employee>) => {
    try {
      const updated = await api.updateEmployee(id, updates);
      setEmployees((prev) => prev.map((e) => (e.id === id ? updated : e)));
      addToast(`Updated staff details for "${updated.name}".`, 'success');
      return updated;
    } catch (err: any) {
      addToast(err.message || 'Failed to update employee', 'error');
      throw err;
    }
  };

  const handleDeleteEmployee = async (id: string) => {
    try {
      const target = employees.find((e) => e.id === id);
      await api.deleteEmployee(id);
      setEmployees((prev) => prev.filter((e) => e.id !== id));
      addToast(`Deleted staff member ${target ? `"${target.name}"` : ''}.`, 'success');
    } catch (err: any) {
      addToast(err.message || 'Failed to delete employee', 'error');
      throw err;
    }
  };

  // Dispatch Actions
  const handleCreateDispatch = async (data: {
    employeeId: string;
    date?: string;
    items: Array<{ productId: string; assignedQty: number; salePrice?: number }>;
  }) => {
    try {
      const newDispatch = await api.createDispatch(data);
      setDispatches((prev) => [newDispatch, ...prev]);
      addToast(`Assigned products to ${newDispatch.employeeName} successfully.`, 'success');
      return newDispatch;
    } catch (err: any) {
      addToast(err.message || 'Failed to assign products', 'error');
      throw err;
    }
  };

  const handleSettleDispatch = async (
    id: string,
    data: {
      cashInHand: number;
      date?: string;
      items?: any[];
    }
  ) => {
    try {
      const result = await api.settleDispatch(id, data);
      setDispatches((prev) => prev.map((d) => (d.id === id ? result.dispatch : d)));
      if (result.products) setProducts(result.products);
      if (result.ledger) setLedger(result.ledger);
      addToast(`Settled dispatch for ${result.dispatch.employeeName}.`, 'success');
      return result;
    } catch (err: any) {
      addToast(err.message || 'Failed to settle dispatch', 'error');
      throw err;
    }
  };

  // Recovery Action
  const handleRecordRecovery = async (data: {
    employeeId: string;
    amount: number;
    date?: string;
    description?: string;
  }) => {
    try {
      const newEntry = await api.recordRecovery(data);
      setLedger((prev) => [newEntry, ...prev]);
      addToast(`Recorded cash recovery of Rs. ${Number(data.amount).toLocaleString()} for ${newEntry.employeeName}.`, 'success');
      return newEntry;
    } catch (err: any) {
      addToast(err.message || 'Failed to record recovery', 'error');
      throw err;
    }
  };

  const handleDeleteLedgerEntry = async (id: string) => {
    try {
      await api.deleteLedgerEntry(id);
      setLedger((prev) => prev.filter((l) => l.id !== id));
      addToast('Deleted ledger entry.', 'success');
    } catch (err: any) {
      addToast(err.message || 'Failed to delete ledger entry', 'error');
      throw err;
    }
  };

  // Reset / Clear Data
  const handleResetData = async () => {
    try {
      await api.resetData();
      setProducts([]);
      setEmployees([]);
      setLedger([]);
      setDispatches([]);
      addToast('All database records cleared.', 'info');
    } catch (err: any) {
      addToast(err.message || 'Failed to clear records', 'error');
      throw err;
    }
  };

  return {
    products,
    employees,
    ledger,
    dispatches,
    isLoading,
    isDbConnected,
    dbInfo,
    refreshData: fetchData,
    addProduct: handleAddProduct,
    updateProduct: handleUpdateProduct,
    deleteProduct: handleDeleteProduct,
    addEmployee: handleAddEmployee,
    updateEmployee: handleUpdateEmployee,
    deleteEmployee: handleDeleteEmployee,
    createDispatch: handleCreateDispatch,
    settleDispatch: handleSettleDispatch,
    recordRecovery: handleRecordRecovery,
    deleteLedgerEntry: handleDeleteLedgerEntry,
    resetData: handleResetData,
  };
}
