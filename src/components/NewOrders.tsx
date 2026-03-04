import React, { useState } from 'react';
import { Truck, ChevronDown, Clock } from 'lucide-react';

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
      // In a real app, this would make an API call
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 bg-blue-100 rounded-lg">
          <Truck size={18} className="text-blue-600" />
        </div>
        <h3 className="text-lg font-bold text-gray-900">New Orders</h3>
        <span className="ml-auto bg-red-100 text-red-700 text-xs font-bold px-2.5 py-1 rounded-full">
          {orders.length}
        </span>
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {orders.map(order => (
          <div key={order.id} className="border border-gray-100 rounded-lg p-3 hover:bg-gray-50 transition-colors">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-semibold text-sm text-gray-900">{order.id}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    order.status === 'pending' 
                      ? 'bg-yellow-100 text-yellow-700' 
                      : 'bg-green-100 text-green-700'
                  }`}>
                    {order.status}
                  </span>
                </div>
                <p className="text-xs text-gray-600">{order.customerName}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-sm text-gray-900">৳{order.total.toLocaleString()}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 mb-3">
              <Clock size={12} className="text-gray-400" />
              <p className="text-xs text-gray-500">{order.orderDate}</p>
            </div>

            <div className="flex gap-2 items-center">
              <select
                value={selectedAssignments[order.id] || ''}
                onChange={(e) => handleAssign(order.id, e.target.value)}
                className="flex-1 text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select personnel...</option>
                {deliveryPersonnel.map(person => (
                  <option key={person.id} value={person.id}>
                    {person.name}
                  </option>
                ))}
              </select>
              <button
                onClick={() => handleConfirmAssignment(order.id)}
                disabled={!selectedAssignments[order.id]}
                className="px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                Assign
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
