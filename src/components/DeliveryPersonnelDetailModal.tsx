import React, { useState, useEffect, useCallback } from 'react';
import { authenticatedFetch } from '../lib/api';
import { X, Loader, Package, CheckCircle2, Truck } from 'lucide-react';

interface DeliveryPersonnelDetailModalProps {
  personnel: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    delivered_orders: number;
    active_orders: number;
  };
  onClose: () => void;
  /** Open a specific order's detail (existing OrderDetailModal in the parent). */
  onOpenOrder: (orderId: number) => void;
}

interface OrdersResponse {
  count: number;
  page: number;
  has_more: boolean;
  results: number[];
}

const PAGE_SIZE = 24;

/** One status section: a chip grid of order IDs with independent "Load more". */
const OrderSection: React.FC<{
  personnelId: number;
  status: 'active' | 'delivered';
  label: string;
  icon: React.ReactNode;
  accent: string;
  total: number;
  onOpenOrder: (orderId: number) => void;
}> = ({ personnelId, status, label, icon, accent, total, onOpenOrder }) => {
  const [ids, setIds] = useState<number[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPage = useCallback(async (pageToLoad: number) => {
    try {
      setLoading(true);
      setError(null);
      const response = await authenticatedFetch(
        `/users/admin/delivery-personnel/${personnelId}/orders/?status=${status}&page=${pageToLoad}&page_size=${PAGE_SIZE}`
      );
      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || 'Failed to load orders');
      }
      const data: OrdersResponse = await response.json();
      setIds((prev) => (pageToLoad === 1 ? data.results : [...prev, ...data.results]));
      setHasMore(data.has_more);
      setPage(data.page);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  }, [personnelId, status]);

  useEffect(() => {
    fetchPage(1);
  }, [fetchPage]);

  return (
    <div className="rounded-lg border border-line bg-panel2 p-4">
      <h3 className="font-mono text-[11px] font-semibold tracking-[.12em] uppercase text-dim mb-3 flex items-center gap-2">
        {icon}
        {label}
        <span className={`font-mono text-[10.5px] font-bold px-1.5 rounded ${accent}`}>{total}</span>
      </h3>

      {loading && ids.length === 0 ? (
        <div className="flex items-center gap-2 py-2 text-mute">
          <Loader size={14} className="animate-spin" />
          <span className="font-mono text-xs">Loading…</span>
        </div>
      ) : error ? (
        <p className="text-[12.5px] text-neg">{error}</p>
      ) : ids.length === 0 ? (
        <p className="text-[12.5px] text-mute">No {label.toLowerCase()} orders.</p>
      ) : (
        <>
          <div className="flex flex-wrap gap-2">
            {ids.map((id) => (
              <button
                key={id}
                onClick={() => onOpenOrder(id)}
                className="font-mono text-[11.5px] font-semibold text-dim bg-panel border border-line rounded-[6px] px-2 py-1 transition hover:border-accent/40 hover:text-accent"
              >
                ORD-{id}
              </button>
            ))}
          </div>

          {hasMore && (
            <button
              onClick={() => fetchPage(page + 1)}
              disabled={loading}
              className="mt-3 inline-flex items-center gap-1.5 font-mono text-[11px] font-semibold uppercase tracking-[.05em] text-accent hover:brightness-110 transition disabled:opacity-50"
            >
              {loading ? <Loader size={12} className="animate-spin" /> : null}
              Load more
            </button>
          )}
        </>
      )}
    </div>
  );
};

const DeliveryPersonnelDetailModal: React.FC<DeliveryPersonnelDetailModalProps> = ({ personnel, onClose, onOpenOrder }) => {
  const initials = `${personnel.first_name?.[0] ?? ''}${personnel.last_name?.[0] ?? ''}`.toUpperCase();

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center px-4 pt-[7vh] pb-[4vh] bg-black/60 animate-fade">
      <div className="w-full max-w-2xl max-h-full flex flex-col bg-panel border border-line rounded-card shadow-[0_30px_80px_-20px_rgba(0,0,0,.87)] overflow-hidden animate-pop">
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-line">
          <div className="w-9 h-9 rounded-lg bg-accent/15 text-accent flex items-center justify-center shrink-0 font-mono font-bold text-sm">
            {initials || <Truck size={17} />}
          </div>
          <div className="flex-1 min-w-0">
            <span className="font-mono font-semibold text-sm tracking-[.04em] text-body">
              {personnel.first_name} {personnel.last_name}
            </span>
            <div className="font-mono text-xs text-mute mt-0.5 truncate">{personnel.email}</div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-[7px] flex items-center justify-center bg-panel border border-line text-dim hover:text-body hover:border-[#3a3d44] transition shrink-0"
          >
            <X size={15} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto flex-1 space-y-4">
          <OrderSection
            personnelId={personnel.id}
            status="active"
            label="Active"
            icon={<Package size={14} className="text-warn" />}
            accent="text-warn bg-warn/[.15]"
            total={personnel.active_orders}
            onOpenOrder={onOpenOrder}
          />
          <OrderSection
            personnelId={personnel.id}
            status="delivered"
            label="Delivered"
            icon={<CheckCircle2 size={14} className="text-pos" />}
            accent="text-pos bg-pos/[.15]"
            total={personnel.delivered_orders}
            onOpenOrder={onOpenOrder}
          />
        </div>
      </div>
    </div>
  );
};

export default DeliveryPersonnelDetailModal;
