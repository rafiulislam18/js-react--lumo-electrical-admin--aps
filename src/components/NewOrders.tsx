import React, { useState, useEffect } from 'react';
import { Truck, Send, Clock, User, DollarSign } from 'lucide-react';

interface Order {
  id: number;
  customer_name: string;
  customer_email: string;
  order_date: string;
  total: string;
  status: string;
  items_count: number;
  delivery_address: string;
}

interface DeliveryPersonnel {
  id: number;
  first_name: string;
  last_name: string;
}

const NewOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [deliveryPersonnel, setDeliveryPersonnel] = useState<DeliveryPersonnel[]>([]);
  const [assigning, setAssigning] = useState<number | null>(null);

  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetchUnassignedOrders();
    fetchDeliveryPersonnel();
  }, []);

  const fetchUnassignedOrders = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_URL}/analytics/unassigned-paid-orders/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setOrders(data.orders);
      }
    } catch (error) {
      console.error('Failed to fetch unassigned orders:', error);
    }
  };

  const fetchDeliveryPersonnel = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_URL}/users/admin/delivery-personnel/?page_size=100`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setDeliveryPersonnel(data.results);
      }
    } catch (error) {
      console.error('Failed to fetch delivery personnel:', error);
    }
  };

  const [selectedAssignments, setSelectedAssignments] = useState<Record<number, string>>({});

  const handleAssign = (orderId: number, personnelId: string) => {
    setSelectedAssignments(prev => ({ ...prev, [orderId]: personnelId }));
  };

  const handleConfirmAssignment = async (orderId: number) => {
    if (!selectedAssignments[orderId]) return;

    setAssigning(orderId);
    try {
      const token = localStorage.getItem('access_token');
      const personnelId = parseInt(selectedAssignments[orderId]);
      const personnel = deliveryPersonnel.find(p => p.id === personnelId);
      const personName = personnel ? `${personnel.first_name} ${personnel.last_name}` : 'Unknown';

      const response = await fetch(`${API_URL}/orders/${orderId}/assign-delivery-personnel/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ assigned_delivery_personnel: personnelId }),
      });

      if (response.ok) {
        setOrders(prev => prev.filter(o => o.id !== orderId));
        setSelectedAssignments(prev => {
          const updated = { ...prev };
          delete updated[orderId];
          return updated;
        });
      } else {
        alert(`Failed to assign order ${orderId} to ${personName}`);
      }
    } catch (error) {
      console.error('Failed to assign delivery personnel:', error);
      alert('Error assigning order');
    } finally {
      setAssigning(null);
    }
  };

  const pendingCount = orders.filter(o => o.status === 'order_placed').length;
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
            const isPending = order.status === 'order_placed';
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
                      {getInitials(order.customer_name)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-bold text-gray-900">ORD-{order.id}</p>
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
                        <p className="truncate text-xs text-gray-600">{order.customer_name}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-shrink-0 items-center gap-1 rounded-lg bg-gray-50 px-2 py-1 ring-1 ring-gray-100">
                    <p className="text-sm font-extrabold text-gray-900">R{parseFloat(order.total).toLocaleString()}</p>
                  </div>
                </div>

                <div className="mb-3 flex items-center gap-1.5 text-xs text-gray-500">
                  <Clock size={12} className="flex-shrink-0" />
                  <p className="font-medium">{new Date(order.order_date).toLocaleDateString()}</p>
                </div>

                <div className="flex items-stretch gap-2">
                  <select
                    value={selectedAssignments[order.id] || ''}
                    onChange={(e) => handleAssign(order.id, e.target.value)}
                    className="flex-1 rounded-lg border border-gray-200 bg-white px-2.5 py-2 text-xs font-medium transition-colors hover:border-blue-300 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="" disabled>Select courier...</option>
                    {deliveryPersonnel.map(person => (
                      <option key={person.id} value={person.id}>{person.first_name} {person.last_name}</option>
                    ))}
                  </select>
                  <button
                    onClick={() => handleConfirmAssignment(order.id)}
                    disabled={!selectedAssignments[order.id] || assigning === order.id}
                    className="flex flex-shrink-0 items-center gap-1.5 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 px-3 py-2 text-xs font-bold text-white shadow-sm transition-all hover:shadow-md hover:shadow-blue-300 disabled:cursor-not-allowed disabled:from-gray-300 disabled:to-gray-300 disabled:shadow-none"
                  >
                    <Send size={13} />
                    <span className="hidden sm:inline">{assigning === order.id ? 'Assigning...' : 'Assign'}</span>
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
