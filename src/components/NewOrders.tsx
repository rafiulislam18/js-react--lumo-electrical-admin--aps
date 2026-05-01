import React, { useState } from 'react';
import { Truck, Send, Clock, User, DollarSign } from 'lucide-react';

interface Order {
  id: string;
  customerName: string;
  orderDate: string;
  total: number;
  status: 'pending' | 'confirmed';
}

interface DeliveryPersonnel {
  id: string;
  name: string;
}

const NewOrders: React.FC = () => {
  const [orders] = useState<Order[]>([
    { id: 'ORD-001', customerName: 'John Smith', orderDate: '2026-03-04', total: 2500, status: 'pending' },
    { id: 'ORD-002', customerName: 'Sarah Johnson', orderDate: '2026-03-04', total: 3200, status: 'pending' },
    { id: 'ORD-003', customerName: 'Mike Davis', orderDate: '2026-03-03', total: 1800, status: 'confirmed' },
    { id: 'ORD-004', customerName: 'Emily Brown', orderDate: '2026-03-02', total: 2100, status: 'pending' },
  ]);

  const deliveryPersonnel: DeliveryPersonnel[] = [
    { id: '1', name: 'Ahmed Hassan' },
    { id: '2', name: 'Karim Khan' },
    { id: '3', name: 'Fatima Ali' },
    { id: '4', name: 'Hassan Ibrahim' },
  ];

  const [selectedAssignments, setSelectedAssignments] = useState<Record<string, string>>({});

  const handleAssign = (orderId: string, personnelId: string) => {
    setSelectedAssignments(prev => ({ ...prev, [orderId]: personnelId }));
  };

  const handleConfirmAssignment = (orderId: string) => {
    if (selectedAssignments[orderId]) {
      alert(`Order ${orderId} assigned to ${deliveryPersonnel.find(p => p.id === selectedAssignments[orderId])?.name}`);
    }
  };

  const pendingCount = orders.filter(o => o.status === 'pending').length;
  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase();

  return (
    <div className="relative flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition-all duration-300 hover:shadow-lg sm:p-6">
      <div className="pointer-events-none absolute -top-20 -right-20 h-56 w-56 rounded-full bg-blue-50/70 blur-3xl" />

      <div className="relative flex flex-col">
        <div className="mb-5 flex items-center gap-3 sm:mb-6">
          <div className="rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 p-2.5 shadow-sm ring-1 ring-blue-200/50">
            <Truck size={18} className="text-blue-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-base font-bold text-gray-900 sm:text-lg lg:text-xl">New Orders</h3>
            <p className="mt-0.5 text-xs font-medium text-gray-500">Awaiting courier assignment</p>
          </div>
          <span className="ml-auto rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 px-3 py-1 text-xs font-bold text-white shadow-sm">
            {pendingCount} pending
          </span>
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto pr-1" style={{ maxHeight: '24rem' }}>
          {orders.map(order => {
            const isPending = order.status === 'pending';
            return (
              <div
                key={order.id}
                className={`group/order relative overflow-hidden rounded-xl border-l-4 bg-white p-3 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md sm:p-4 ${
                  isPending
                    ? 'border-l-amber-400 bg-gradient-to-br from-amber-50/40 to-white'
                    : 'border-l-emerald-400 bg-gradient-to-br from-emerald-50/40 to-white'
                }`}
              >
                <div className="mb-3 flex items-start justify-between gap-2">
                  <div className="flex min-w-0 flex-1 items-center gap-2.5">
                    {/* Customer avatar */}
                    <div className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold text-white shadow-sm ${
                      isPending
                        ? 'bg-gradient-to-br from-amber-400 to-orange-500'
                        : 'bg-gradient-to-br from-emerald-400 to-green-600'
                    }`}>
                      {getInitials(order.customerName)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-bold text-gray-900">{order.id}</p>
                        <span className={`whitespace-nowrap rounded-full px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-wider ring-1 ${
                          isPending
                            ? 'bg-amber-50 text-amber-700 ring-amber-200'
                            : 'bg-emerald-50 text-emerald-700 ring-emerald-200'
                        }`}>
                          {isPending ? 'Pending' : 'Confirmed'}
                        </span>
                      </div>
                      <div className="mt-0.5 flex items-center gap-1">
                        <User size={12} className="text-gray-400" />
                        <p className="truncate text-xs text-gray-600">{order.customerName}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-shrink-0 items-center gap-1 rounded-lg bg-gray-50 px-2 py-1 ring-1 ring-gray-100">
                    <DollarSign size={12} className="text-emerald-600" />
                    <p className="text-sm font-extrabold text-gray-900">{order.total.toLocaleString()}</p>
                  </div>
                </div>

                <div className="mb-3 flex items-center gap-1.5 text-xs text-gray-500">
                  <Clock size={12} className="flex-shrink-0" />
                  <p className="font-medium">{order.orderDate}</p>
                </div>

                <div className="flex items-stretch gap-2">
                  <select
                    value={selectedAssignments[order.id] || ''}
                    onChange={(e) => handleAssign(order.id, e.target.value)}
                    className="flex-1 rounded-lg border border-gray-200 bg-white px-2.5 py-2 text-xs font-medium transition-colors hover:border-blue-300 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="" disabled>Select courier...</option>
                    {deliveryPersonnel.map(person => (
                      <option key={person.id} value={person.id}>{person.name}</option>
                    ))}
                  </select>
                  <button
                    onClick={() => handleConfirmAssignment(order.id)}
                    disabled={!selectedAssignments[order.id]}
                    className="flex flex-shrink-0 items-center gap-1.5 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 px-3 py-2 text-xs font-bold text-white shadow-sm transition-all hover:shadow-md hover:shadow-blue-300 disabled:cursor-not-allowed disabled:from-gray-300 disabled:to-gray-300 disabled:shadow-none"
                  >
                    <Send size={13} />
                    <span className="hidden sm:inline">Assign</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {orders.length === 0 && (
          <div className="py-8 text-center">
            <Truck size={32} className="mx-auto mb-2 text-gray-300" />
            <p className="text-sm text-gray-500">No new orders</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NewOrders;
