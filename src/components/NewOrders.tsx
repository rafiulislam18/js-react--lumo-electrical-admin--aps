import React, { useState } from 'react';
import { Truck, Send, Clock, User } from 'lucide-react';

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
  const [orders, setOrders] = useState<Order[]>([
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
    setSelectedAssignments(prev => ({
      ...prev,
      [orderId]: personnelId
    }));
  };

  const handleConfirmAssignment = (orderId: string) => {
    if (selectedAssignments[orderId]) {
      alert(`Order ${orderId} assigned to ${deliveryPersonnel.find(p => p.id === selectedAssignments[orderId])?.name}`);
    }
  };

  const pendingCount = orders.filter(o => o.status === 'pending').length;

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 flex flex-col">
      <div className="flex items-center gap-3 mb-4 sm:mb-6">
        <div className="p-2.5 bg-blue-100 rounded-lg">
          <Truck size={18} className="text-blue-600" />
        </div>
        <h3 className="text-base sm:text-lg lg:text-xl font-bold text-gray-900">New Orders</h3>
        <span className="ml-auto bg-blue-100 text-blue-700 text-xs font-bold px-2.5 py-1.5 rounded-full">
          {pendingCount}
        </span>
      </div>

      <div className="space-y-2 sm:space-y-3 flex-1 overflow-y-auto max-h-96">
        {orders.map(order => (
          <div key={order.id} className="border border-gray-100 rounded-xl p-3 sm:p-4 hover:shadow-md hover:border-blue-200 transition-all duration-200 group">
            <div className="flex items-start justify-between gap-2 mb-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <p className="font-semibold text-sm text-gray-900">{order.id}</p>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-semibold whitespace-nowrap ${
                    order.status === 'pending' 
                      ? 'bg-amber-100 text-amber-700' 
                      : 'bg-emerald-100 text-emerald-700'
                  }`}>
                    {order.status === 'pending' ? '⏳ Pending' : '✓ Confirmed'}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <User size={14} className="text-gray-400" />
                  <p className="text-xs text-gray-600 truncate">{order.customerName}</p>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="font-bold text-sm text-gray-900">${order.total.toLocaleString()}</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 mb-3 text-xs text-gray-500">
              <Clock size={13} className="flex-shrink-0" />
              <p>{order.orderDate}</p>
            </div>

            <div className="flex gap-2 items-stretch">
              <select
                value={selectedAssignments[order.id] || ''}
                onChange={(e) => handleAssign(order.id, e.target.value)}
                className="flex-1 text-xs border border-gray-200 rounded-lg px-2.5 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-blue-300 transition-colors"
              >
                <option value="" disabled>Select courier...</option>
                {deliveryPersonnel.map(person => (
                  <option key={person.id} value={person.id}>
                    {person.name}
                  </option>
                ))}
              </select>
              <button
                onClick={() => handleConfirmAssignment(order.id)}
                disabled={!selectedAssignments[order.id]}
                className="px-3 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-1.5 flex-shrink-0"
              >
                <Send size={14} />
                <span className="hidden sm:inline">Assign</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {orders.length === 0 && (
        <div className="text-center py-8">
          <Truck size={32} className="text-gray-300 mx-auto mb-2" />
          <p className="text-gray-500 text-sm">No new orders</p>
        </div>
      )}
    </div>
  );
};

export default NewOrders;
