import React from 'react';

export const Skeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`skeleton ${className}`} />
);

const TableHeader: React.FC<{ columns: string[] }> = ({ columns }) => (
  <div className="hidden md:grid border-b border-slate-200 bg-slate-100/60 px-5 py-3.5 grid-cols-12 gap-3">
    {columns.map((col) => (
      <div key={col} className={col}>
        <Skeleton className="h-2.5 w-16 rounded" />
      </div>
    ))}
  </div>
);

const CardChrome: React.FC<{ children: React.ReactNode; filter?: React.ReactNode }> = ({
  children,
  filter,
}) => (
  <section className="space-y-6">
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      <div className="p-4 sm:p-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-5 w-52 rounded-md" />
          <Skeleton className="h-3 w-72 max-w-full rounded" />
        </div>
        <Skeleton className="h-9 w-36 rounded-xl" />
      </div>
      {filter}
      {children}
    </div>
  </section>
);

export const ProductsPageSkeleton: React.FC = () => (
  <CardChrome
    filter={
      <div className="p-4 bg-slate-50/70 border-b border-slate-200 flex flex-col sm:flex-row gap-3">
        <Skeleton className="h-10 flex-1 rounded-xl" />
        <div className="flex gap-2">
          <Skeleton className="h-10 w-24 rounded-xl" />
          <Skeleton className="h-10 w-28 rounded-xl" />
        </div>
      </div>
    }
  >
    <TableHeader
      columns={[
        'col-span-3',
        'col-span-2',
        'col-span-2',
        'col-span-2',
        'col-span-2',
        'col-span-1',
      ]}
    />
    <div className="hidden md:block divide-y divide-slate-200/80">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="grid grid-cols-12 gap-3 items-center px-5 py-3.5">
          <div className="col-span-3 flex items-center space-x-2.5">
            <Skeleton className="w-8 h-8 rounded-lg" />
            <div className="space-y-1.5">
              <Skeleton className="h-3.5 w-28 rounded" />
              <Skeleton className="h-2.5 w-16 rounded" />
            </div>
          </div>
          <div className="col-span-2 flex justify-end">
            <Skeleton className="h-3.5 w-12 rounded" />
          </div>
          <div className="col-span-2 flex justify-end">
            <Skeleton className="h-3.5 w-16 rounded" />
          </div>
          <div className="col-span-2 flex justify-end">
            <Skeleton className="h-3.5 w-16 rounded" />
          </div>
          <div className="col-span-2 flex justify-end">
            <Skeleton className="h-3.5 w-14 rounded" />
          </div>
          <div className="col-span-1 flex justify-center gap-1.5">
            <Skeleton className="w-7 h-7 rounded-lg" />
            <Skeleton className="w-7 h-7 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
    <div className="md:hidden divide-y divide-slate-200">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="p-4 space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-2.5">
              <Skeleton className="w-9 h-9 rounded-xl" />
              <div className="space-y-1.5">
                <Skeleton className="h-3.5 w-28 rounded" />
                <Skeleton className="h-2.5 w-16 rounded" />
              </div>
            </div>
            <div className="flex gap-1">
              <Skeleton className="w-8 h-8 rounded-lg" />
              <Skeleton className="w-8 h-8 rounded-lg" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <Skeleton className="h-10 rounded-xl" />
            <Skeleton className="h-10 rounded-xl" />
            <Skeleton className="h-10 rounded-xl" />
          </div>
        </div>
      ))}
    </div>
  </CardChrome>
);

export const EmployeesPageSkeleton: React.FC = () => (
  <CardChrome
    filter={
      <div className="p-4 bg-slate-50/70 border-b border-slate-200">
        <Skeleton className="h-10 w-full rounded-xl" />
      </div>
    }
  >
    <TableHeader columns={['col-span-3', 'col-span-3', 'col-span-3', 'col-span-2', 'col-span-1']} />
    <div className="hidden md:block divide-y divide-slate-200/80">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="grid grid-cols-12 gap-3 items-center px-5 py-3.5">
          <div className="col-span-3 flex items-center space-x-2.5">
            <Skeleton className="w-8 h-8 rounded-lg" />
            <div className="space-y-1.5">
              <Skeleton className="h-3.5 w-24 rounded" />
              <Skeleton className="h-2.5 w-14 rounded" />
            </div>
          </div>
          <div className="col-span-3">
            <Skeleton className="h-3.5 w-28 rounded" />
          </div>
          <div className="col-span-3">
            <Skeleton className="h-3.5 w-36 rounded" />
          </div>
          <div className="col-span-2 flex justify-end">
            <Skeleton className="h-3.5 w-16 rounded" />
          </div>
          <div className="col-span-1 flex justify-center gap-1.5">
            <Skeleton className="w-7 h-7 rounded-lg" />
            <Skeleton className="w-7 h-7 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
    <div className="md:hidden divide-y divide-slate-200">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="p-4 space-y-2.5">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-2.5">
              <Skeleton className="w-9 h-9 rounded-xl" />
              <div className="space-y-1.5">
                <Skeleton className="h-3.5 w-28 rounded" />
                <Skeleton className="h-2.5 w-16 rounded" />
              </div>
            </div>
            <div className="flex gap-1">
              <Skeleton className="w-8 h-8 rounded-lg" />
              <Skeleton className="w-8 h-8 rounded-lg" />
            </div>
          </div>
          <Skeleton className="h-3 w-40 rounded" />
          <Skeleton className="h-3 w-52 rounded" />
        </div>
      ))}
    </div>
  </CardChrome>
);

export const DispatchPageSkeleton: React.FC = () => (
  <section className="space-y-6">
    <div className="flex p-1.5 bg-slate-100/90 rounded-2xl border border-slate-200/80 max-w-md mx-auto gap-2">
      <Skeleton className="h-11 flex-1 rounded-xl" />
      <Skeleton className="h-11 flex-1 rounded-xl" />
    </div>
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      <div className="p-4 sm:p-6 border-b border-slate-200 space-y-2">
        <Skeleton className="h-5 w-64 rounded-md" />
        <Skeleton className="h-3 w-80 max-w-full rounded" />
      </div>
      <div className="p-4 sm:p-6 space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Skeleton className="h-16 rounded-xl" />
          <Skeleton className="h-16 rounded-xl" />
        </div>
        <div className="border border-slate-200 rounded-xl overflow-hidden">
          <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex items-center justify-between">
            <Skeleton className="h-3 w-40 rounded" />
            <Skeleton className="h-3 w-28 rounded" />
          </div>
          <div className="divide-y divide-slate-200">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="p-4 flex items-center justify-between gap-3">
                <div className="flex items-center space-x-3">
                  <Skeleton className="w-8 h-8 rounded-lg" />
                  <div className="space-y-1.5">
                    <Skeleton className="h-3.5 w-28 rounded" />
                    <Skeleton className="h-2.5 w-20 rounded" />
                  </div>
                </div>
                <Skeleton className="h-9 w-24 rounded-xl" />
              </div>
            ))}
          </div>
        </div>
        <Skeleton className="h-11 w-full rounded-xl" />
      </div>
    </div>
  </section>
);

export const LedgerPageSkeleton: React.FC = () => (
  <CardChrome
    filter={
      <div className="p-4 bg-slate-50/70 border-b border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Skeleton className="h-16 rounded-xl" />
        <Skeleton className="h-16 rounded-xl" />
      </div>
    }
  >
    <TableHeader
      columns={['col-span-2', 'col-span-2', 'col-span-3', 'col-span-2', 'col-span-1', 'col-span-1', 'col-span-1']}
    />
    <div className="hidden md:block divide-y divide-slate-200/80">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="grid grid-cols-12 gap-3 items-center px-5 py-3.5">
          <div className="col-span-2">
            <Skeleton className="h-3.5 w-20 rounded" />
          </div>
          <div className="col-span-2">
            <Skeleton className="h-3.5 w-24 rounded" />
          </div>
          <div className="col-span-3">
            <Skeleton className="h-3.5 w-40 rounded" />
          </div>
          <div className="col-span-2 flex justify-end">
            <Skeleton className="h-3.5 w-16 rounded" />
          </div>
          <div className="col-span-1 flex justify-end">
            <Skeleton className="h-3.5 w-10 rounded" />
          </div>
          <div className="col-span-1 flex justify-end">
            <Skeleton className="h-3.5 w-10 rounded" />
          </div>
          <div className="col-span-1 flex justify-center">
            <Skeleton className="w-7 h-7 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
    <div className="md:hidden divide-y divide-slate-200">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="p-4 space-y-2.5">
          <div className="flex items-start justify-between">
            <div className="space-y-1.5">
              <Skeleton className="h-3.5 w-28 rounded" />
              <Skeleton className="h-2.5 w-40 rounded" />
            </div>
            <Skeleton className="w-7 h-7 rounded-lg" />
          </div>
          <div className="grid grid-cols-3 gap-2">
            <Skeleton className="h-12 rounded-xl" />
            <Skeleton className="h-12 rounded-xl" />
            <Skeleton className="h-12 rounded-xl" />
          </div>
        </div>
      ))}
    </div>
  </CardChrome>
);
