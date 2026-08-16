import React, { useState, useMemo } from 'react';
import {
  Users,
  Plus,
  Search,
  Edit2,
  Trash2,
  Phone,
  MapPin,
} from 'lucide-react';
import { Employee } from '../types';
import { Button } from './common/Button';
import { Input } from './common/Input';
import { Modal } from './common/Modal';
import { Badge } from './common/Badge';
import { EmptyState } from './common/EmptyState';

export interface EmployeesCardProps {
  employees: Employee[];
  onAddEmployee: (data: Omit<Employee, 'id'>) => Promise<any>;
  onUpdateEmployee: (id: string, updates: Partial<Employee>) => Promise<any>;
  onRequestDelete: (employee: Employee) => void;
}

export const EmployeesCard: React.FC<EmployeesCardProps> = ({
  employees,
  onAddEmployee,
  onUpdateEmployee,
  onRequestDelete,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [salary, setSalary] = useState<string | number>('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const handleOpenCreate = () => {
    setEditingEmployee(null);
    setName('');
    setSalary('');
    setPhone('');
    setAddress('');
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (emp: Employee) => {
    setEditingEmployee(emp);
    setName(emp.name);
    setSalary(emp.salary);
    setPhone(emp.phone || '');
    setAddress(emp.address || '');
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setFormError('Staff name is required');
      return;
    }

    setIsSubmitting(true);
    setFormError(null);

    try {
      if (editingEmployee) {
        await onUpdateEmployee(editingEmployee.id, {
          name: name.trim(),
          salary: Number(salary) || 0,
          phone: phone.trim(),
          address: address.trim(),
        });
      } else {
        await onAddEmployee({
          name: name.trim(),
          salary: Number(salary) || 0,
          phone: phone.trim(),
          address: address.trim(),
        });
      }
      setIsModalOpen(false);
    } catch (err: any) {
      setFormError(err.message || 'Failed to save staff member');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      const q = searchTerm.toLowerCase();
      return (
        emp.name.toLowerCase().includes(q) ||
        (emp.phone && emp.phone.includes(q)) ||
        (emp.address && emp.address.toLowerCase().includes(q))
      );
    });
  }, [employees, searchTerm]);

  return (
    <section id="employees-section" className="space-y-6">
      {/* Directory Container */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Header Bar */}
        <div className="p-4 sm:p-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
              <span>Staff & Rider Directory</span>
              <Badge variant="neutral" size="sm">
                {filteredEmployees.length} Staff
              </Badge>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Manage field personnel assigned to product dispatches and cash collections
            </p>
          </div>

          <Button
            variant="primary"
            onClick={handleOpenCreate}
            leftIcon={<Plus className="w-4 h-4" />}
            className="text-xs sm:text-sm"
          >
            Add New Staff
          </Button>
        </div>

        {/* Search Bar */}
        <div className="p-4 bg-slate-50/70 border-b border-slate-200">
          <Input
            placeholder="Search staff by name, phone number, or address..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            leftIcon={<Search className="w-4 h-4 text-slate-400" />}
            className="bg-white"
          />
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-100/60 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                <th className="py-3.5 px-5">Staff Member</th>
                <th className="py-3.5 px-5">Contact Mobile</th>
                <th className="py-3.5 px-5">Residential Address</th>
                <th className="py-3.5 px-5 text-right">Base Salary</th>
                <th className="py-3.5 px-5 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/80 text-xs sm:text-sm">
              {filteredEmployees.map((emp) => (
                <tr key={emp.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-5">
                    <div className="flex items-center space-x-2.5">
                      <div className="w-8 h-8 rounded-lg bg-blue-950 text-white flex items-center justify-center font-bold text-xs shrink-0">
                        {emp.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <span className="font-semibold text-slate-900">{emp.name}</span>
                        <span className="block text-[11px] text-slate-400">ID: {emp.id}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-5 text-slate-700 font-mono">
                    {emp.phone ? (
                      <span className="inline-flex items-center space-x-1.5">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <span>{emp.phone}</span>
                      </span>
                    ) : (
                      <span className="text-slate-400 italic">Not provided</span>
                    )}
                  </td>
                  <td className="py-3.5 px-5 text-slate-600">
                    {emp.address ? (
                      <span className="inline-flex items-center space-x-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate max-w-xs">{emp.address}</span>
                      </span>
                    ) : (
                      <span className="text-slate-400 italic">Not provided</span>
                    )}
                  </td>
                  <td className="py-3.5 px-5 text-right font-bold text-slate-900 font-mono">
                    Rs. {emp.salary.toLocaleString()}
                  </td>
                  <td className="py-3.5 px-5 text-center">
                    <div className="flex items-center justify-center space-x-1.5">
                      <button
                        onClick={() => handleOpenEdit(emp)}
                        title="Edit staff member"
                        aria-label={`Edit ${emp.name}`}
                        className="p-1.5 text-slate-500 hover:text-blue-900 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onRequestDelete(emp)}
                        title="Delete staff member"
                        aria-label={`Delete ${emp.name}`}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Responsive Card List */}
        <div className="md:hidden divide-y divide-slate-200">
          {filteredEmployees.map((emp) => (
            <div key={emp.id} className="p-4 space-y-2.5">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2.5">
                  <div className="w-9 h-9 rounded-xl bg-blue-950 text-white flex items-center justify-center font-bold text-sm">
                    {emp.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm leading-tight">{emp.name}</h4>
                    <span className="text-[10px] text-slate-400">ID: {emp.id}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => handleOpenEdit(emp)}
                    className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg"
                    aria-label="Edit"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onRequestDelete(emp)}
                    className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg"
                    aria-label="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="text-xs space-y-1 text-slate-600 pl-1">
                {emp.phone && (
                  <div className="flex items-center space-x-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-mono">{emp.phone}</span>
                  </div>
                )}
                {emp.address && (
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{emp.address}</span>
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500">Monthly Salary:</span>
                <span className="font-bold text-blue-950 font-mono">
                  Rs. {emp.salary.toLocaleString()}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredEmployees.length === 0 && (
          <EmptyState
            icon={<Users className="w-7 h-7 text-blue-900" />}
            title="No Staff Members Found"
            description={
              searchTerm
                ? `No staff match "${searchTerm}".`
                : 'No staff profiles created yet. Add your riders and sales agents to start assigning inventory.'
            }
            actionLabel={searchTerm ? 'Clear Search' : 'Add First Staff Member'}
            onAction={searchTerm ? () => setSearchTerm('') : handleOpenCreate}
            className="m-4"
          />
        )}
      </div>

      {/* Staff Add / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingEmployee ? 'Edit Staff Profile' : 'Add New Staff Member'}
        description="Fill in employee contact and salary details"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">
              {formError}
            </div>
          )}

          <Input
            label="Full Name"
            required
            placeholder="e.g. Ahmed Javed"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Contact Phone"
              type="tel"
              placeholder="0300-1234567"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              leftIcon={<Phone className="w-4 h-4" />}
            />
            <Input
              label="Monthly Salary (Rs.)"
              type="number"
              min="0"
              required
              placeholder="0"
              value={salary}
              onChange={(e) => setSalary(e.target.value)}
            />
          </div>

          <Input
            label="Home / Route Address"
            placeholder="e.g. Sector 4, Main Commercial Bazaar"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            leftIcon={<MapPin className="w-4 h-4" />}
          />

          <div className="mt-6 flex justify-end space-x-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsModalOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting}>
              {editingEmployee ? 'Save Changes' : 'Register Staff'}
            </Button>
          </div>
        </form>
      </Modal>
    </section>
  );
};
