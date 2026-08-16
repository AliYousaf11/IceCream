import React, { useState, useMemo } from 'react';
import {
  BookOpen,
  Filter,
  Plus,
  Trash2,
  Search,
  User,
  Calendar,
  Download,
} from 'lucide-react';
import { LedgerEntry, Employee } from '../types';
import { Button } from './common/Button';
import { Input } from './common/Input';
import { Select } from './common/Select';
import { Badge } from './common/Badge';
import { EmptyState } from './common/EmptyState';
import { RecoveryModal } from './RecoveryCard';

export interface LedgerTableCardProps {
  ledger: LedgerEntry[];
  employees: Employee[];
  onRecordRecovery: (data: {
    employeeId: string;
    amount: number;
    date?: string;
    description?: string;
  }) => Promise<any>;
  onDeleteLedgerEntry: (id: string) => Promise<any>;
  onRequestDelete: (entry: LedgerEntry) => void;
}

export const LedgerTableCard: React.FC<LedgerTableCardProps> = ({
  ledger,
  employees,
  onRecordRecovery,
  onRequestDelete,
}) => {
  const [selectedEmployeeFilter, setSelectedEmployeeFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'shortage' | 'recovery' | 'extra'>('all');
  const [isRecoveryModalOpen, setIsRecoveryModalOpen] = useState(false);

  // Filtered Ledger
  const filteredLedger = useMemo(() => {
    return ledger.filter((entry) => {
      if (selectedEmployeeFilter !== 'all' && entry.employeeId !== selectedEmployeeFilter) {
        return false;
      }
      if (typeFilter === 'shortage' && !(entry.shortage > 0)) return false;
      if (typeFilter === 'recovery' && !(entry.recovery > 0)) return false;
      if (typeFilter === 'extra' && !(entry.extra > 0)) return false;
      return true;
    });
  }, [ledger, selectedEmployeeFilter, typeFilter]);

  // Export to CSV
  const handleExportCSV = () => {
    if (filteredLedger.length === 0) return;

    const headers = ['Date', 'Staff Name', 'Description', 'Shortage', 'Extra', 'Recovery', 'Created At'];
    const rows = filteredLedger.map((e) => [
      e.date,
      `"${e.employeeName}"`,
      `"${e.description || ''}"`,
      e.shortage,
      e.extra,
      e.recovery,
      e.createdAt,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Ice_Cream_Store_Ledger_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <section id="ledger-section" className="space-y-6">
      {/* Main Ledger Container */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Header Bar */}
        <div className="p-4 sm:p-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
              <span>Financial Ledger & Shortage Tracking</span>
              <Badge variant="neutral" size="sm">
                {filteredLedger.length} Records
              </Badge>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Complete historical transaction logs for staff shortages, extras, and recoveries
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCSV}
              disabled={filteredLedger.length === 0}
              leftIcon={<Download className="w-4 h-4" />}
            >
              Export CSV
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsRecoveryModalOpen(true)}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Record Recovery
            </Button>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="p-4 bg-slate-50/70 border-b border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Select
            label="Filter by Staff Member"
            value={selectedEmployeeFilter}
            onChange={(e) => setSelectedEmployeeFilter(e.target.value)}
            leftIcon={<User className="w-4 h-4 text-slate-400" />}
            className="bg-white"
          >
            <option value="all">All Staff Members</option>
            {employees.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.name}
              </option>
            ))}
          </Select>

          <Select
            label="Filter by Entry Type"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as any)}
            leftIcon={<Filter className="w-4 h-4 text-slate-400" />}
            className="bg-white"
          >
            <option value="all">All Transaction Types</option>
            <option value="shortage">Shortages Only</option>
            <option value="recovery">Recoveries Only</option>
            <option value="extra">Extras Only</option>
          </Select>
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-100/60 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                <th className="py-3.5 px-5">Date</th>
                <th className="py-3.5 px-5">Staff Member</th>
                <th className="py-3.5 px-5">Description</th>
                <th className="py-3.5 px-5 text-right">Shortage</th>
                <th className="py-3.5 px-5 text-right">Extra</th>
                <th className="py-3.5 px-5 text-right">Recovery Paid</th>
                <th className="py-3.5 px-5 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/80 text-xs sm:text-sm">
              {filteredLedger.map((entry) => (
                <tr key={entry.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-5 font-mono text-slate-600">
                    <span className="inline-flex items-center space-x-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{entry.date}</span>
                    </span>
                  </td>
                  <td className="py-3.5 px-5 font-semibold text-slate-900">
                    {entry.employeeName}
                  </td>
                  <td className="py-3.5 px-5 text-slate-600">
                    <span className="truncate block max-w-xs">{entry.description}</span>
                  </td>
                  <td className="py-3.5 px-5 text-right font-mono font-bold">
                    {entry.shortage > 0 ? (
                      <span className="text-rose-600">Rs. {entry.shortage.toLocaleString()}</span>
                    ) : (
                      <span className="text-slate-300">-</span>
                    )}
                  </td>
                  <td className="py-3.5 px-5 text-right font-mono font-bold">
                    {entry.extra > 0 ? (
                      <span className="text-blue-700">Rs. {entry.extra.toLocaleString()}</span>
                    ) : (
                      <span className="text-slate-300">-</span>
                    )}
                  </td>
                  <td className="py-3.5 px-5 text-right font-mono font-bold">
                    {entry.recovery > 0 ? (
                      <span className="text-emerald-700">Rs. {entry.recovery.toLocaleString()}</span>
                    ) : (
                      <span className="text-slate-300">-</span>
                    )}
                  </td>
                  <td className="py-3.5 px-5 text-center">
                    <button
                      onClick={() => onRequestDelete(entry)}
                      title="Delete ledger entry"
                      aria-label="Delete entry"
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Responsive Card List */}
        <div className="md:hidden divide-y divide-slate-200">
          {filteredLedger.map((entry) => (
            <div key={entry.id} className="p-4 space-y-2.5">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{entry.employeeName}</h4>
                  <div className="flex items-center space-x-2 text-[11px] text-slate-500 mt-0.5">
                    <span>{entry.date}</span>
                    <span>•</span>
                    <span className="truncate max-w-[180px]">{entry.description}</span>
                  </div>
                </div>
                <button
                  onClick={() => onRequestDelete(entry)}
                  className="p-1.5 text-slate-400 hover:text-rose-600"
                  aria-label="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2 bg-slate-50 p-2.5 rounded-xl text-center text-xs">
                <div>
                  <span className="text-[10px] text-slate-500 block">Shortage</span>
                  <span className={`font-bold ${entry.shortage > 0 ? 'text-rose-600' : 'text-slate-400'}`}>
                    {entry.shortage > 0 ? `Rs. ${entry.shortage}` : '-'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">Extra</span>
                  <span className={`font-bold ${entry.extra > 0 ? 'text-blue-700' : 'text-slate-400'}`}>
                    {entry.extra > 0 ? `Rs. ${entry.extra}` : '-'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">Recovery</span>
                  <span className={`font-bold ${entry.recovery > 0 ? 'text-emerald-700' : 'text-slate-400'}`}>
                    {entry.recovery > 0 ? `Rs. ${entry.recovery}` : '-'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredLedger.length === 0 && (
          <EmptyState
            icon={<BookOpen className="w-7 h-7 text-blue-900" />}
            title="No Ledger Records"
            description="There are no transaction records matching your current filter criteria."
            actionLabel="Record Recovery Payment"
            onAction={() => setIsRecoveryModalOpen(true)}
            className="m-4"
          />
        )}
      </div>

      {/* Cash Recovery Modal */}
      <RecoveryModal
        isOpen={isRecoveryModalOpen}
        onClose={() => setIsRecoveryModalOpen(false)}
        employees={employees}
        defaultEmployeeId={selectedEmployeeFilter !== 'all' ? selectedEmployeeFilter : undefined}
        onRecordRecovery={onRecordRecovery}
      />
    </section>
  );
};
