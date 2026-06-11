import React, { useState, useEffect } from 'react';
import { Truck, Send, Clock, User } from 'lucide-react';
import { authenticatedFetch } from '../lib/api';

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

  useEffect(() => {
    fetchUnassignedOrders();
    fetchDeliveryPersonnel();
  }, []);

  const fetchUnassignedOrders = async () => {
    try {
      const response = await authenticatedFetch('/analytics/unassigned-paid-orders/');

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
      const response = await authenticatedFetch('/users/admin/delivery-personnel/?page_size=100');

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
      const personnelId = parseInt(selectedAssignments[orderId]);
      const personnel = deliveryPersonnel.find(p => p.id === personnelId);
      const personName = personnel ? `${personnel.first_name} ${personnel.last_name}` : 'Unknown';

      const response = await authenticatedFetch(`/orders/${orderId}/assign-delivery-personnel/`, {
        method: 'PATCH',
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
    <div className="flex min-w-0 flex-col rounded-card border border-line bg-panel">
      {/* Panel header */}
      <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-[11px]">
        <span className="inline-flex items-center gap-2 font-mono text-[11px] font-semibold uppercase tracking-[.12em] text-dim">
          <Truck size={13} className="text-accent" />
          New Orders
          <span className="font-mono text-[10.5px] normal-case tracking-normal text-mute">
            awaiting courier
          </span>
        </span>
        <span className="inline-flex items-center gap-[5px] whitespace-nowrap rounded-[5px] border border-warn/[.28] bg-warn/[.13] px-2 py-[3px] font-mono text-[10.5px] font-semibold uppercase tracking-[.05em] text-warn">
          {pendingCount} pending
        </span>
      </div>

      <div className="flex-1 space-y-2.5 overflow-y-auto p-4" style={{ maxHeight: '24rem' }}>
        {orders.map(order => {
          const isPending = order.status === 'order_placed';
          return (
            <div
              key={order.id}
              className={`rounded-lg border border-line border-l-2 bg-panel2 px-3.5 py-[13px] ${
                isPending ? 'border-l-warn' : 'border-l-accent'
              }`}
            >
              <div className="mb-3 flex items-start justify-between gap-2">
                <div className="flex min-w-0 flex-1 items-start gap-2.5">
                  {/* Customer avatar */}
                  <div className="flex h-[34px] w-[34px] flex-shrink-0 items-center justify-center rounded-[7px] border border-line bg-panel font-mono text-xs font-bold text-dim">
                    {getInitials(order.customer_name)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-mono text-[13px] font-semibold text-body">ORD-{order.id}</p>
                      <span
                        className={`inline-flex whitespace-nowrap rounded-[5px] px-2 py-[3px] font-mono text-[10.5px] font-semibold uppercase tracking-[.05em] ${
                          isPending
                            ? 'border border-warn/[.28] bg-warn/[.13] text-warn'
                            : 'border border-accent/[.28] bg-accent/[.13] text-accent'
                        }`}
                      >
                        {isPending ? 'Pending' : 'Confirmed'}
                      </span>
                    </div>
                    <div className="mt-0.5 flex items-center gap-1">
                      <User size={12} className="text-mute" />
                      <p className="truncate text-xs text-dim">{order.customer_name}</p>
                    </div>
                  </div>
                </div>
                <p className="flex-shrink-0 font-mono text-sm font-bold text-body">
                  R{parseFloat(order.total).toLocaleString()}
                </p>
              </div>

              <div className="mb-3 flex items-center gap-1.5 font-mono text-[11px] text-mute">
                <Clock size={12} className="flex-shrink-0" />
                <p>{new Date(order.order_date).toLocaleDateString()}</p>
              </div>

              <div className="flex items-stretch gap-2">
                <select
                  value={selectedAssignments[order.id] || ''}
                  onChange={(e) => handleAssign(order.id, e.target.value)}
                  className="min-w-0 flex-1 rounded-[7px] border border-line bg-panel px-2.5 py-2 text-xs text-body outline-none transition-colors focus:border-accent/50"
                >
                  <option value="" disabled>Select courier...</option>
                  {deliveryPersonnel.map(person => (
                    <option key={person.id} value={person.id}>{person.first_name} {person.last_name}</option>
                  ))}
                </select>
                <button
                  onClick={() => handleConfirmAssignment(order.id)}
                  disabled={!selectedAssignments[order.id] || assigning === order.id}
                  className="inline-flex flex-shrink-0 items-center justify-center gap-1.5 rounded-[7px] border border-accent bg-accent px-3 py-2 text-xs font-bold text-accent-ink transition hover:brightness-110 disabled:cursor-not-allowed disabled:border-line disabled:bg-panel disabled:text-mute"
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
        <div className="py-[54px] text-center text-mute">
          <Truck size={30} className="mx-auto opacity-50" />
          <p className="mt-3 text-[13.5px] font-semibold text-dim">No new orders</p>
        </div>
      )}
    </div>
  );
};

export default NewOrders;
