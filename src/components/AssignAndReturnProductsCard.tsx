import React, { useState, useEffect, useMemo } from 'react';
import {
  Send,
  RotateCcw,
  CheckCircle2,
  Calendar,
  User,
  AlertCircle,
  TrendingDown,
  TrendingUp,
  Receipt,
  Package,
  Layers,
  Sparkles,
} from 'lucide-react';
import { Product, Employee, DispatchAssignment } from '../types';
import { Button } from './common/Button';
import { Input } from './common/Input';
import { Select } from './common/Select';
import { Badge } from './common/Badge';
import { EmptyState } from './common/EmptyState';

export interface AssignAndReturnProductsCardProps {
  products: Product[];
  employees: Employee[];
  dispatches: DispatchAssignment[];
  onCreateDispatch: (data: {
    employeeId: string;
    date?: string;
    items: Array<{ productId: string; assignedQty: number; salePrice?: number }>;
  }) => Promise<any>;
  onSettleDispatch: (
    id: string,
    data: {
      cashInHand: number;
      date?: string;
      items?: any[];
    }
  ) => Promise<any>;
}

export const AssignAndReturnProductsCard: React.FC<AssignAndReturnProductsCardProps> = ({
  products,
  employees,
  dispatches,
  onCreateDispatch,
  onSettleDispatch,
}) => {
  const [activeWorkflowTab, setActiveWorkflowTab] = useState<'assign' | 'return'>('assign');

  // ================= ASSIGN FORM STATE =================
  const [assignDate, setAssignDate] = useState<string>(
    new Date().toLocaleDateString('en-US')
  );
  const [selectedAssignEmployeeId, setSelectedAssignEmployeeId] = useState<string>(
    employees[0]?.id || ''
  );
  const [assignQuantities, setAssignQuantities] = useState<{ [productId: string]: number }>({});
  const [isAssigning, setIsAssigning] = useState(false);

  // ================= RETURN / SETTLE FORM STATE =================
  const [selectedReturnEmployeeId, setSelectedReturnEmployeeId] = useState<string>(
    employees[0]?.id || ''
  );
  const [returnQuantities, setReturnQuantities] = useState<{ [productId: string]: number }>({});
  const [cashInHandInput, setCashInHandInput] = useState<string>('');
  const [settleDate, setSettleDate] = useState<string>(
    new Date().toLocaleDateString('en-US')
  );
  const [isSettling, setIsSettling] = useState(false);

  // Sync employee selections
  useEffect(() => {
    if (employees.length > 0) {
      if (!selectedAssignEmployeeId || !employees.some((e) => e.id === selectedAssignEmployeeId)) {
        setSelectedAssignEmployeeId(employees[0].id);
      }
      if (!selectedReturnEmployeeId || !employees.some((e) => e.id === selectedReturnEmployeeId)) {
        setSelectedReturnEmployeeId(employees[0].id);
      }
    } else {
      setSelectedAssignEmployeeId('');
      setSelectedReturnEmployeeId('');
    }
  }, [employees, selectedAssignEmployeeId, selectedReturnEmployeeId]);

  // Find active unsettled dispatch for selected return employee
  const activeDispatch = useMemo(() => {
    return dispatches.find(
      (d) => d.employeeId === selectedReturnEmployeeId && d.status === 'DRAFT'
    );
  }, [dispatches, selectedReturnEmployeeId]);

  // Initialize return quantities when active dispatch changes
  useEffect(() => {
    if (activeDispatch) {
      const initialReturns: { [productId: string]: number } = {};
      activeDispatch.items.forEach((item) => {
        initialReturns[item.productId] = item.returnQty || 0;
      });
      setReturnQuantities(initialReturns);
      setCashInHandInput(activeDispatch.cashInHand > 0 ? String(activeDispatch.cashInHand) : '');
    } else {
      setReturnQuantities({});
      setCashInHandInput('');
    }
  }, [activeDispatch]);

  // Assign Total Calculations
  const assignTotals = useMemo(() => {
    let totalQty = 0;
    let totalPrice = 0;
    products.forEach((p) => {
      const qty = assignQuantities[p.id] || 0;
      totalQty += qty;
      totalPrice += qty * (p.salePrice || 0);
    });
    return { totalQty, totalPrice };
  }, [products, assignQuantities]);

  // Return / Settlement Calculations
  const settlementCalculation = useMemo(() => {
    if (!activeDispatch) {
      return {
        totalAssignPrice: 0,
        totalReturnPrice: 0,
        expectedCash: 0,
        cashInHand: 0,
        shortage: 0,
        extra: 0,
        itemsWithCalculations: [],
      };
    }

    let totalAssignPrice = 0;
    let totalReturnPrice = 0;

    const itemsWithCalculations = activeDispatch.items.map((item) => {
      const assignedQty = item.assignedQty;
      const returnQty = returnQuantities[item.productId] || 0;
      const salePrice = item.salePrice;
      const itemAssignPrice = assignedQty * salePrice;
      const itemReturnPrice = returnQty * salePrice;
      const netSoldQty = Math.max(0, assignedQty - returnQty);
      const netSoldAmount = itemAssignPrice - itemReturnPrice;

      totalAssignPrice += itemAssignPrice;
      totalReturnPrice += itemReturnPrice;

      return {
        ...item,
        assignedQty,
        returnQty,
        salePrice,
        totalAssignPrice: itemAssignPrice,
        totalReturnPrice: itemReturnPrice,
        netSoldQty,
        netSoldAmount,
      };
    });

    const expectedCash = totalAssignPrice - totalReturnPrice;
    const actualCash = Number(cashInHandInput) || 0;
    const diff = expectedCash - actualCash;

    const shortage = diff > 0 ? diff : 0;
    const extra = diff < 0 ? Math.abs(diff) : 0;

    return {
      totalAssignPrice,
      totalReturnPrice,
      expectedCash,
      cashInHand: actualCash,
      shortage,
      extra,
      itemsWithCalculations,
    };
  }, [activeDispatch, returnQuantities, cashInHandInput]);

  // Handle Assign Submit
  const handleAssignSubmit = async () => {
    const items = products
      .filter((p) => (assignQuantities[p.id] || 0) > 0)
      .map((p) => ({
        productId: p.id,
        assignedQty: assignQuantities[p.id],
        salePrice: p.salePrice,
      }));

    if (items.length === 0) {
      alert('Please enter assignment quantity for at least one product.');
      return;
    }

    setIsAssigning(true);
    try {
      await onCreateDispatch({
        employeeId: selectedAssignEmployeeId,
        date: assignDate,
        items,
      });
      setAssignQuantities({});
      setActiveWorkflowTab('return');
      setSelectedReturnEmployeeId(selectedAssignEmployeeId);
    } finally {
      setIsAssigning(false);
    }
  };

  // Handle Settle Submit
  const handleSettleSubmit = async () => {
    if (!activeDispatch) return;

    setIsSettling(true);
    try {
      await onSettleDispatch(activeDispatch.id, {
        cashInHand: Number(cashInHandInput) || 0,
        date: settleDate,
        items: settlementCalculation.itemsWithCalculations,
      });
    } finally {
      setIsSettling(false);
    }
  };

  return (
    <section id="dispatch-section" className="space-y-6">
      {/* Workflow Tabs */}
      <div className="flex p-1.5 bg-slate-100/90 rounded-2xl border border-slate-200/80 max-w-md mx-auto">
        <button
          type="button"
          onClick={() => setActiveWorkflowTab('assign')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center space-x-2 transition-all ${
            activeWorkflowTab === 'assign'
              ? 'bg-[#1e40af] text-white font-bold border-2 border-[#03132e] shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Send className={`w-4 h-4 ${activeWorkflowTab === 'assign' ? 'text-white' : 'text-[#1e40af]'}`} />
          <span>Assign Stock</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveWorkflowTab('return')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center space-x-2 transition-all ${
            activeWorkflowTab === 'return'
              ? 'bg-[#1e40af] text-white font-bold border-2 border-[#03132e] shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <RotateCcw className={`w-4 h-4 ${activeWorkflowTab === 'return' ? 'text-amber-300' : 'text-amber-600'}`} />
          <span>Return Stock</span>
        </button>
      </div>

      {/* ================= STEP 1: ASSIGN STOCK ================= */}
      {activeWorkflowTab === 'assign' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-slate-200">
            <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
              <span>Assign Products to Field Staff</span>
              <Badge variant="info" size="sm">
                Step 1
              </Badge>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Select an employee and allocate daily stock inventory for field distribution
            </p>
          </div>

          <div className="p-4 sm:p-6 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Dispatch Date (Locked to Today)"
                value={assignDate}
                disabled
                leftIcon={<Calendar className="w-4 h-4" />}
                helperText="Automatically recorded on creation"
              />

              <Select
                label="Select Staff Member / Rider"
                value={selectedAssignEmployeeId}
                onChange={(e) => setSelectedAssignEmployeeId(e.target.value)}
                disabled={employees.length === 0}
                leftIcon={<User className="w-4 h-4" />}
              >
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name} ({emp.phone || 'No phone'})
                  </option>
                ))}
                {employees.length === 0 && <option value="">No employees available</option>}
              </Select>
            </div>

            {/* Product Assignment Table */}
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">Inventory Items to Assign</span>
                <span className="text-xs text-slate-500">
                  Total Allocated: <strong className="text-blue-950 font-bold">Rs. {assignTotals.totalPrice.toLocaleString()}</strong>
                </span>
              </div>

              <div className="divide-y divide-slate-200 max-h-96 overflow-y-auto">
                {products.map((p) => {
                  const qty = assignQuantities[p.id] || 0;
                  const itemTotal = qty * p.salePrice;
                  const remainingAfterAssign = Math.max(0, p.quantity - qty);
                  const hasStock = p.quantity > 0;

                  return (
                    <div
                      key={p.id}
                      className="p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 hover:bg-slate-50/50"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-950 flex items-center justify-center font-bold text-xs shrink-0">
                          {p.name.charAt(0)}
                        </div>
                        <div>
                          <div className="text-xs sm:text-sm font-bold text-slate-900">{p.name}</div>
                          <div className="text-[11px] text-slate-500">
                            Available:{' '}
                            {hasStock ? (
                              <span className="font-semibold text-slate-700">{p.quantity}</span>
                            ) : (
                              <span className="font-semibold text-rose-600">no stock</span>
                            )}{' '}
                            | Remaining after assign:{' '}
                            {remainingAfterAssign > 0 ? (
                              <span className="font-semibold text-emerald-700">{remainingAfterAssign}</span>
                            ) : (
                              <span className="font-semibold text-rose-600">no stock</span>
                            )}{' '}
                            | Rate: Rs. {p.salePrice}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3 self-end sm:self-auto">
                        <div className="w-28 sm:w-32">
                          {hasStock ? (
                            <Input
                              type="number"
                              min="0"
                              max={p.quantity}
                              placeholder="0"
                              value={assignQuantities[p.id] || ''}
                              onChange={(e) => {
                                const val = Math.max(0, parseInt(e.target.value, 10) || 0);
                                setAssignQuantities((prev) => ({ ...prev, [p.id]: val }));
                              }}
                              className="text-right font-mono"
                            />
                          ) : (
                            <Input
                              type="text"
                              value="no stock"
                              disabled
                              className="text-right font-semibold text-rose-600"
                            />
                          )}
                        </div>
                        <div className="w-28 text-right font-mono text-xs font-bold text-blue-950">
                          Rs. {itemTotal.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {products.length === 0 && (
                  <div className="p-8 text-center text-xs text-slate-400">
                    No products in stock. Add products first to assign inventory.
                  </div>
                )}
              </div>
            </div>

            {/* Total Footer & Confirm Button */}
            <div className="p-4 bg-slate-50 rounded-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <span className="text-xs text-slate-500 block">Total Summary</span>
                <span className="text-base font-black text-slate-900">
                  {assignTotals.totalQty} Units | Rs. {assignTotals.totalPrice.toLocaleString()}
                </span>
              </div>
              <Button
                variant="primary"
                onClick={handleAssignSubmit}
                isLoading={isAssigning}
                disabled={employees.length === 0 || assignTotals.totalQty === 0}
                leftIcon={<CheckCircle2 className="w-4 h-4 text-amber-300" />}
              >
                Confirm & Assign
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ================= STEP 2: RETURN & SETTLE ================= */}
      {activeWorkflowTab === 'return' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-slate-200">
            <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
              <span>Return Unsold Stock & Cash Settlement</span>
              <Badge variant="warning" size="sm">
                Step 2
              </Badge>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Record returned stock from field, verify cash in hand, and reconcile shortage/extra balances
            </p>
          </div>

          <div className="p-4 sm:p-6 space-y-6">
            {/* Staff Selector */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="Select Staff Member"
                value={selectedReturnEmployeeId}
                onChange={(e) => setSelectedReturnEmployeeId(e.target.value)}
                disabled={employees.length === 0}
                leftIcon={<User className="w-4 h-4" />}
              >
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name} ({emp.phone || 'No phone'})
                  </option>
                ))}
              </Select>

              <Input
                label="Settlement Date"
                value={settleDate}
                disabled
                leftIcon={<Calendar className="w-4 h-4" />}
              />
            </div>

            {activeDispatch ? (
              <div className="space-y-6">
                {/* Active Assignment Items Table */}
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <div className="bg-blue-950 text-white px-4 py-3 flex items-center justify-between">
                    <span className="text-xs font-bold">
                      Active Dispatch #{activeDispatch.id} — Assigned Items
                    </span>
                    <Badge variant="purple" size="sm">
                      DRAFT
                    </Badge>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-50 text-[11px] font-bold text-slate-600 uppercase border-b border-slate-200">
                          <th className="py-3 px-4">Product</th>
                          <th className="py-3 px-4 text-right">Assigned Qty</th>
                          <th className="py-3 px-4 text-right">Unit Rate</th>
                          <th className="py-3 px-4 text-right">Assign Total</th>
                          <th className="py-3 px-4 text-center">Return Qty</th>
                          <th className="py-3 px-4 text-right">Return Value</th>
                          <th className="py-3 px-4 text-right">Sold Qty</th>
                          <th className="py-3 px-4 text-right">Sold Amount</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {settlementCalculation.itemsWithCalculations.map((item) => (
                          <tr key={item.productId} className="hover:bg-slate-50/60">
                            <td className="py-3 px-4 font-semibold text-slate-900">
                              {item.productName}
                            </td>
                            <td className="py-3 px-4 text-right font-mono font-bold">
                              {item.assignedQty}
                            </td>
                            <td className="py-3 px-4 text-right font-mono text-slate-600">
                              Rs. {item.salePrice}
                            </td>
                            <td className="py-3 px-4 text-right font-mono font-bold text-blue-950">
                              Rs. {item.totalAssignPrice.toLocaleString()}
                            </td>
                            <td className="py-2 px-3 text-center">
                              <input
                                type="number"
                                min="0"
                                max={item.assignedQty}
                                placeholder="0"
                                value={returnQuantities[item.productId] ?? item.returnQty ?? ''}
                                onChange={(e) => {
                                  const val = Math.min(
                                    item.assignedQty,
                                    Math.max(0, parseInt(e.target.value, 10) || 0)
                                  );
                                  setReturnQuantities((prev) => ({
                                    ...prev,
                                    [item.productId]: val,
                                  }));
                                }}
                                className="w-20 px-2 py-1 text-center font-mono text-xs border border-amber-300 rounded-lg bg-amber-50/50 focus:bg-white focus:ring-2 focus:ring-amber-500"
                              />
                            </td>
                            <td className="py-3 px-4 text-right font-mono text-amber-800">
                              Rs. {item.totalReturnPrice.toLocaleString()}
                            </td>
                            <td className="py-3 px-4 text-right font-mono font-bold text-emerald-700">
                              {item.netSoldQty}
                            </td>
                            <td className="py-3 px-4 text-right font-mono font-black text-emerald-800">
                              Rs. {item.netSoldAmount.toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Cash Reconciliation Card */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
                  <h4 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                    <Receipt className="w-4 h-4 text-blue-900" />
                    <span>Cash Reconciliation</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-3 bg-white border border-slate-200 rounded-xl">
                      <span className="text-[11px] text-slate-500 block">Total Expected Cash</span>
                      <span className="text-lg font-black text-slate-900 font-mono">
                        Rs. {settlementCalculation.expectedCash.toLocaleString()}
                      </span>
                    </div>

                    <div className="p-3 bg-white border border-slate-200 rounded-xl">
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">
                        Cash Received in Hand (Rs.)
                      </label>
                      <input
                        type="number"
                        min="0"
                        placeholder="0"
                        value={cashInHandInput}
                        onChange={(e) => setCashInHandInput(e.target.value)}
                        className="w-full text-sm px-3 py-1.5 rounded-lg border border-slate-300 font-mono font-bold focus:ring-2 focus:ring-blue-950"
                      />
                    </div>

                    <div className="p-3 bg-white border border-slate-200 rounded-xl">
                      <span className="text-[11px] text-slate-500 block">Settlement Difference</span>
                      {settlementCalculation.shortage > 0 ? (
                        <span className="text-lg font-black text-rose-600 font-mono flex items-center space-x-1">
                          <TrendingDown className="w-4 h-4 inline" />
                          <span>Shortage: Rs. {settlementCalculation.shortage.toLocaleString()}</span>
                        </span>
                      ) : settlementCalculation.extra > 0 ? (
                        <span className="text-lg font-black text-emerald-600 font-mono flex items-center space-x-1">
                          <TrendingUp className="w-4 h-4 inline" />
                          <span>Extra: Rs. {settlementCalculation.extra.toLocaleString()}</span>
                        </span>
                      ) : (
                        <span className="text-lg font-black text-slate-700 font-mono">
                          Exact Match (Rs. 0)
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <Button
                      variant="primary"
                      onClick={handleSettleSubmit}
                      isLoading={isSettling}
                      leftIcon={<CheckCircle2 className="w-4 h-4 text-emerald-300" />}
                    >
                      Confirm Settlement & Record to Ledger
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <EmptyState
                icon={<AlertCircle className="w-7 h-7 text-slate-400" />}
                title="No Active Dispatch Found"
                description="This staff member does not currently have any unsettled dispatch assignments."
                actionLabel="Create Dispatch for Staff"
                onAction={() => {
                  setSelectedAssignEmployeeId(selectedReturnEmployeeId);
                  setActiveWorkflowTab('assign');
                }}
              />
            )}
          </div>
        </div>
      )}
    </section>
  );
};
