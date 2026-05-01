import React from 'react';
import { TrendingUp, ShoppingCart, Crown, ArrowRight } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  category: string;
  totalSold: number;
  totalRevenue: string;
  emoji: string;
}

const PopularProducts: React.FC = () => {
  const products: Product[] = [
    { id: '1', name: 'LED Bulb 60W', category: 'Lighting', totalSold: 1245, totalRevenue: 'R18,675', emoji: '💡' },
    { id: '2', name: 'Power Strip 6 Outlet', category: 'Accessories', totalSold: 892, totalRevenue: 'R13,380', emoji: '🔌' },
    { id: '3', name: 'Electrical Wire 10 AWG', category: 'Wire & Cable', totalSold: 756, totalRevenue: 'R11,340', emoji: '🔗' },
    { id: '4', name: 'Circuit Breaker 20A', category: 'Safety', totalSold: 543, totalRevenue: 'R10,860', emoji: '⚡' },
  ].sort((a, b) => b.totalSold - a.totalSold);

  const maxSold = products[0]?.totalSold || 1;

  const rankStyles = [
    'from-amber-300 via-yellow-400 to-amber-500 shadow-amber-300/50',
    'from-slate-300 via-slate-400 to-slate-500 shadow-slate-300/50',
    'from-orange-300 via-orange-400 to-amber-600 shadow-orange-300/50',
    'from-emerald-300 via-emerald-400 to-green-600 shadow-emerald-300/50',
  ];

  return (
    <div className="relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition-all duration-300 hover:shadow-lg sm:p-6">
      <div className="pointer-events-none absolute -top-20 -right-20 h-56 w-56 rounded-full bg-emerald-50/70 blur-3xl" />

      <div className="relative">
        <div className="mb-5 flex items-start gap-3 sm:mb-6">
          <div className="rounded-xl bg-gradient-to-br from-emerald-100 to-green-100 p-2.5 shadow-sm ring-1 ring-emerald-200/50">
            <TrendingUp size={18} className="text-emerald-600" />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900 sm:text-lg lg:text-xl">Popular Products</h3>
            <p className="mt-0.5 text-xs font-medium text-gray-500">Top sellers this period</p>
          </div>
        </div>

        <div className="space-y-2.5">
          {products.map((product, index) => {
            const isTop = index === 0;
            const widthPct = (product.totalSold / maxSold) * 100;

            return (
              <div
                key={product.id}
                className={`group/row relative overflow-hidden rounded-xl border p-3 transition-all duration-200 hover:shadow-md sm:p-4 ${
                  isTop
                    ? 'border-amber-200 bg-gradient-to-br from-amber-50 via-yellow-50/50 to-white'
                    : 'border-gray-100 bg-white hover:border-emerald-100 hover:bg-gradient-to-r hover:from-emerald-50/50 hover:to-transparent'
                }`}
              >
                {/* Volume background bar */}
                <div
                  className={`pointer-events-none absolute left-0 top-0 h-full opacity-30 transition-all duration-500 ${
                    isTop ? 'bg-gradient-to-r from-amber-100 to-transparent' : 'bg-gradient-to-r from-emerald-50 to-transparent'
                  }`}
                  style={{ width: `${widthPct}%` }}
                />

                <div className="relative flex items-center justify-between gap-3">
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    {/* Rank Badge */}
                    <div
                      className={`relative flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br text-xs font-extrabold text-white shadow-md sm:h-10 sm:w-10 sm:text-sm ${rankStyles[index]}`}
                    >
                      {isTop && (
                        <Crown
                          size={12}
                          className="absolute -top-2 -right-1.5 rotate-12 fill-amber-400 text-amber-600"
                        />
                      )}
                      {index + 1}
                    </div>

                    {/* Product Icon */}
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 text-base shadow-sm transition-all duration-200 group-hover/row:shadow-md sm:h-12 sm:w-12 sm:text-lg">
                      {product.emoji}
                    </div>

                    {/* Product Info */}
                    <div className="min-w-0 flex-1">
                      <p
                        className={`truncate text-xs font-bold transition-colors sm:text-sm ${
                          isTop ? 'text-amber-900' : 'text-gray-900 group-hover/row:text-emerald-700'
                        }`}
                      >
                        {product.name}
                      </p>
                      <p className="text-xs font-medium text-gray-500">{product.category}</p>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex flex-shrink-0 flex-col items-end gap-0.5">
                    <div className="flex items-center gap-1.5">
                      <ShoppingCart size={13} className={isTop ? 'text-amber-600' : 'text-emerald-600'} />
                      <span className="text-xs font-extrabold text-gray-900 sm:text-sm">
                        {product.totalSold.toLocaleString()}
                      </span>
                    </div>
                    <p
                      className={`text-xs font-bold ${
                        isTop ? 'text-amber-700' : 'text-emerald-600'
                      }`}
                    >
                      {product.totalRevenue}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-5 border-t border-gray-100 pt-4 sm:mt-6">
          <button className="group/btn inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 transition-all duration-200 hover:text-emerald-700 sm:text-sm">
            View All Products
            <ArrowRight
              size={14}
              className="transition-transform duration-200 group-hover/btn:translate-x-1"
            />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PopularProducts;
