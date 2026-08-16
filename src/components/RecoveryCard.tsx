import React, { useState } from 'react';
import { Banknote, User, Calendar, FileText, CheckCircle2 } from 'lucide-react';
import { Employee } from '../types';
import { Button } from './common/Button';
import { Input } from './common/Input';
import { Select } from './common/Select';
import { Modal } from './common/Modal';

export interface RecoveryModalProps {
  isOpen: boolean;
  onClose: () => void;
  employees: Employee[];
  defaultEmployeeId?: string;
  onRecordRecovery: (data: {
    employeeId: string;
    amount: number;
    date?: string;
    description?: string;
  }) => Promise<any>;
}

export const RecoveryModal: React.FC<RecoveryModalProps> = ({
  isOpen,
  onClose,
  employees,
  defaultEmployeeId,
  onRecordRecovery,
}) => {
  const [employeeId, setEmployeeId] = useState<string>(defaultEmployeeId || employees[0]?.id || '');
  const [amount, setAmount] = useState<string | number>('');
  const [date, setDate] = useState<string>(new Date().toLocaleDateString('en-US'));
  const [description, setDescription] = useState<string>('Cash Recovery / Shortage Repayment');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const recoveryAmount = Number(amount);
    if (!recoveryAmount || recoveryAmount <= 0) {
      setError('Please enter a recovery payment amount greater than zero.');
      return;
    }
    if (!employeeId) {
      setError('Please select an employee.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await onRecordRecovery({
        employeeId,
        amount: recoveryAmount,
        date,
        description: description.trim(),
      });
      setAmount('');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to record recovery payment');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Record Cash Recovery Payment"
      description="Record payments made by staff to recover past shortage balances"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">
            {error}
          </div>
        )}

        <Select
          label="Staff Member"
          required
          value={employeeId}
          onChange={(e) => setEmployeeId(e.target.value)}
          leftIcon={<User className="w-4 h-4" />}
        >
          {employees.map((emp) => (
            <option key={emp.id} value={emp.id}>
              {emp.name} ({emp.phone || 'No phone'})
            </option>
          ))}
        </Select>

        <Input
          label="Payment Amount (Rs.)"
          type="number"
          min="1"
          required
          placeholder="e.g. 1500"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          leftIcon={<Banknote className="w-4 h-4" />}
        />

        <Input
          label="Payment Date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          leftIcon={<Calendar className="w-4 h-4" />}
        />

        <Input
          label="Payment Remarks / Reference"
          placeholder="e.g. Cleared shortage for week 2"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          leftIcon={<FileText className="w-4 h-4" />}
        />

        <div className="mt-6 flex justify-end space-x-2 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={isSubmitting}
            leftIcon={<CheckCircle2 className="w-4 h-4 text-emerald-300" />}
          >
            Record Recovery
          </Button>
        </div>
      </form>
    </Modal>
  );
};
