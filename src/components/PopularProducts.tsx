import React, { useState, useEffect } from 'react';
import { TrendingUp, ShoppingCart, Crown, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { authenticatedFetch } from '../lib/api';

interface Product {
  id: number;
  name: string;
  image: string;
  price: string;
  sold_count: number;
  rating: number;
  reviews: number;
}

const PopularProducts: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPopularProducts();
  }, []);

  const fetchPopularProducts = async () => {
    try {
      const response = await authenticatedFetch('/analytics/popular-products/');

      if (response.ok) {
        const data = await response.json();
        setProducts(data.products);
      }
    } catch (error) {
      console.error('Failed to fetch popular products:', error);
    }
  };

  // Use fetched data or fallback to empty
  const maxSold = products[0]?.sold_count || 1;

  return (
    <div className="flex min-w-0 flex-col rounded-card border border-line bg-panel">
      {/* Panel header */}
      <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-[11px]">
        <span className="inline-flex items-center gap-2 font-mono text-[11px] font-semibold uppercase tracking-[.12em] text-dim">
          <TrendingUp size={13} className="text-accent" />
          Popular Products
        </span>
        <span className="font-mono text-[11px] text-mute">TOP SELLERS</span>
      </div>

      {/* Table */}
      <div className="min-w-0 overflow-x-auto">
        <table className="w-full border-collapse font-mono">
          <thead>
            <tr>
              <th className="whitespace-nowrap border-b border-line px-4 py-2.5 text-left font-mono text-[10px] font-semibold uppercase tracking-[.08em] text-mute">#</th>
              <th className="whitespace-nowrap border-b border-line px-4 py-2.5 text-left font-mono text-[10px] font-semibold uppercase tracking-[.08em] text-mute">Product</th>
              <th className="whitespace-nowrap border-b border-line px-4 py-2.5 text-right font-mono text-[10px] font-semibold uppercase tracking-[.08em] text-mute">Price</th>
              <th className="whitespace-nowrap border-b border-line px-4 py-2.5 text-right font-mono text-[10px] font-semibold uppercase tracking-[.08em] text-mute">Sold</th>
              <th className="whitespace-nowrap border-b border-line px-4 py-2.5 text-right font-mono text-[10px] font-semibold uppercase tracking-[.08em] text-mute">Revenue</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product, index) => {
              const isTop = index === 0;
              const widthPct = (product.sold_count / maxSold) * 100;

              return (
                <tr key={product.id} className="transition-colors hover:bg-panel2/50">
                  <td
                    className={`border-b border-line px-4 py-2.5 align-middle font-mono text-xs font-bold ${
                      isTop ? 'text-accent' : 'text-mute'
                    }`}
                  >
                    <span className="inline-flex items-center gap-1">
                      {String(index + 1).padStart(2, '0')}
                      {isTop && <Crown size={11} className="text-accent" />}
                    </span>
                  </td>
                  <td className="border-b border-line px-4 py-2.5 align-middle">
                    <div className="flex min-w-0 items-center gap-2.5">
                      <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center overflow-hidden rounded-[5px] border border-line bg-panel2">
                        {product.image ? (
                          <img
                            src={`${import.meta.env.VITE_BASE_URL}${product.image}`}
                            alt={product.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <ShoppingCart size={12} className="text-mute" />
                        )}
                      </div>
                      <span className="max-w-[200px] truncate whitespace-nowrap text-[12.5px] text-body">
                        {product.name}
                      </span>
                    </div>
                  </td>
                  <td className="whitespace-nowrap border-b border-line px-4 py-2.5 text-right align-middle font-mono text-[12.5px] text-dim">
                    R{product.price}
                  </td>
                  <td className="whitespace-nowrap border-b border-line px-4 py-2.5 text-right align-middle">
                    <div className="flex items-center justify-end gap-2">
                      <span className="hidden h-[5px] w-12 overflow-hidden rounded-full bg-panel2 sm:block">
                        <span
                          className="block h-full rounded-full bg-accent"
                          style={{ width: `${widthPct}%` }}
                        />
                      </span>
                      <span className="font-mono text-[12.5px] text-body">
                        {product.sold_count.toLocaleString()}
                      </span>
                    </div>
                  </td>
                  <td className="whitespace-nowrap border-b border-line px-4 py-2.5 text-right align-middle font-mono text-[12.5px] font-bold text-accent">
                    R{(parseFloat(product.price) * product.sold_count).toLocaleString()}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="px-4 py-3">
        <button
          className="group/btn inline-flex items-center gap-1.5 font-mono text-[11.5px] font-semibold uppercase tracking-[.05em] text-accent transition hover:brightness-110"
          onClick={() => navigate('/products')}
        >
          View All Products
          <ArrowRight
            size={13}
            className="transition-transform duration-200 group-hover/btn:translate-x-1"
          />
        </button>
      </div>
    </div>
  );
};

export default PopularProducts;
