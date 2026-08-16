import React, { useState, useMemo } from 'react';
import { ActiveTab, Product, Employee, LedgerEntry } from './types';
import { useAuth } from './hooks/useAuth';
import { useToast } from './hooks/useToast';
import { useConfirmDialog } from './hooks/useConfirmDialog';
import { useAppData } from './hooks/useAppData';

import { Navbar } from './components/Navbar';
import { ProductsCard } from './components/ProductsCard';
import { EmployeesCard } from './components/EmployeesCard';
import { AssignAndReturnProductsCard } from './components/AssignAndReturnProductsCard';
import { LedgerTableCard } from './components/LedgerTableCard';
import { AuthScreen } from './components/auth/AuthScreen';
import { ConfirmDialog } from './components/common/ConfirmDialog';
import { ToastContainer } from './components/common/ToastContainer';
import { GlobalLoader } from './components/common/GlobalLoader';
import {
  ProductsPageSkeleton,
  EmployeesPageSkeleton,
  DispatchPageSkeleton,
  LedgerPageSkeleton,
} from './components/common/Skeleton';

export function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('products');

  // Custom Hooks
  const { toasts, addToast, removeToast } = useToast();
  const { confirmDialogProps, openConfirmDialog } = useConfirmDialog();
  const { user, isAuthenticated, isLoading: isAuthLoading, signin, signup, logout } = useAuth();

  const {
    products,
    employees,
    ledger,
    dispatches,
    isDbConnected,
    dbInfo,
    refreshData,
    addProduct,
    updateProduct,
    deleteProduct,
    addEmployee,
    updateEmployee,
    deleteEmployee,
    createDispatch,
    settleDispatch,
    recordRecovery,
    deleteLedgerEntry,
    resetData,
    isLoading,
  } = useAppData(addToast, user?.id);

  // Count active unsettled dispatches
  const unsettledDispatchCount = useMemo(
    () => dispatches.filter((d) => d.status === 'DRAFT').length,
    [dispatches]
  );

  // Delete Handlers with Confirmation Dialog
  const handleDeleteProductRequest = (product: Product) => {
    openConfirmDialog({
      title: `Delete "${product.name}"?`,
      message: `Are you sure you want to delete "${product.name}" from the inventory? This action cannot be undone.`,
      confirmLabel: 'Delete Product',
      variant: 'danger',
      onConfirm: async () => {
        await deleteProduct(product.id);
      },
    });
  };

  const handleDeleteEmployeeRequest = (employee: Employee) => {
    openConfirmDialog({
      title: `Delete Staff "${employee.name}"?`,
      message: `Are you sure you want to delete staff member "${employee.name}"? Historical ledger records will remain saved.`,
      confirmLabel: 'Delete Staff',
      variant: 'danger',
      onConfirm: async () => {
        await deleteEmployee(employee.id);
      },
    });
  };

  const handleDeleteLedgerRequest = (entry: LedgerEntry) => {
    openConfirmDialog({
      title: 'Delete Ledger Entry?',
      message: `Are you sure you want to remove this ledger entry for ${entry.employeeName} (${entry.date})?`,
      confirmLabel: 'Delete Entry',
      variant: 'danger',
      onConfirm: async () => {
        await deleteLedgerEntry(entry.id);
      },
    });
  };

  const handleClearDatabaseRequest = () => {
    openConfirmDialog({
      title: 'Clear All Database Records?',
      message:
        'This will permanently erase all Products, Employees, Dispatch Records, and Ledger history from MongoDB. This action is irreversible.',
      confirmLabel: 'Clear All Records',
      variant: 'danger',
      onConfirm: async () => {
        await resetData();
      },
    });
  };

  if (isAuthLoading) {
    return <GlobalLoader message="Loading Ice Cream Store..." />;
  }

  // Not Logged In -> Show Dedicated Auth Screen
  if (!isAuthenticated || !user) {
    return (
      <>
        <AuthScreen
          onSignIn={async (data) => {
            const res = await signin(data);
            addToast(`Welcome back, ${res.user.name}!`, 'success');
            return res;
          }}
          onSignUp={async (data) => {
            const res = await signup(data);
            addToast(`Account created for ${res.user.name}!`, 'success');
            return res;
          }}
        />
        <ToastContainer toasts={toasts} onRemove={removeToast} />
      </>
    );
  }

  // Logged In -> Show Full ERP Application
  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 font-sans flex flex-col pb-20 md:pb-10">
      {/* Top Navigation & App Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isDbConnected={isDbConnected}
        dbInfo={dbInfo}
        user={user}
        onOpenAuth={() => {}}
        onLogout={logout}
        onRefresh={() => refreshData(true)}
        onResetData={handleClearDatabaseRequest}
        productsCount={products.length}
        employeesCount={employees.length}
        unsettledDispatchCount={unsettledDispatchCount}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {isLoading && activeTab === 'products' && <ProductsPageSkeleton />}
        {isLoading && activeTab === 'employees' && <EmployeesPageSkeleton />}
        {isLoading && activeTab === 'dispatch' && <DispatchPageSkeleton />}
        {isLoading && activeTab === 'ledger' && <LedgerPageSkeleton />}

        {!isLoading && activeTab === 'products' && (
          <ProductsCard
            products={products}
            onAddProduct={addProduct}
            onUpdateProduct={updateProduct}
            onDeleteProduct={deleteProduct}
            onRequestDelete={handleDeleteProductRequest}
          />
        )}

        {!isLoading && activeTab === 'employees' && (
          <EmployeesCard
            employees={employees}
            onAddEmployee={addEmployee}
            onUpdateEmployee={updateEmployee}
            onRequestDelete={handleDeleteEmployeeRequest}
          />
        )}

        {!isLoading && activeTab === 'dispatch' && (
          <AssignAndReturnProductsCard
            products={products}
            employees={employees}
            dispatches={dispatches}
            onCreateDispatch={createDispatch}
            onSettleDispatch={settleDispatch}
          />
        )}

        {!isLoading && activeTab === 'ledger' && (
          <LedgerTableCard
            ledger={ledger}
            employees={employees}
            onRecordRecovery={recordRecovery}
            onDeleteLedgerEntry={deleteLedgerEntry}
            onRequestDelete={handleDeleteLedgerRequest}
          />
        )}
      </main>

      {/* Global Confirmation Dialog (For all deletes & resets) */}
      <ConfirmDialog {...confirmDialogProps} />

      {/* Global Toast Notifications */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}

export default App;
