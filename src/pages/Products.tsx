import React, { useState, useEffect, useCallback } from 'react';
import {
  Package,
  Search,
  Plus,
  Edit2,
  Trash2,
  Star,
  TrendingUp,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface Category {
  id: number;
  name: string;
  slug: string;
}

interface Product {
  id: number;
  name: string;
  price: string;
  old_price: string | null;
  image: string;
  avg_rating: number;
  total_reviews: number;
  badge: 'Hot' | 'New' | 'Sale' | '';
  in_stock: boolean;
  discount_percentage: number;
  created_at: string;
  category: Category;
  sold_count: number;
}

interface ProductListResponse {
  count: number;
  page: number;
  page_size: number;
  results: Product[];
}

const Products: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const API_URL = import.meta.env.VITE_API_URL;

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch products whenever page, page size, or search changes
  useEffect(() => {
    fetchProducts();
  }, [currentPage, pageSize, debouncedSearch]);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('access_token');

      const params = new URLSearchParams({
        page: currentPage.toString(),
        page_size: pageSize.toString(),
      });

      if (debouncedSearch) {
        params.append('search', debouncedSearch);
      }

      const response = await fetch(`${API_URL}/products/admin/list/?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          const refreshToken = localStorage.getItem('refresh_token');
          if (refreshToken) {
            const refreshResponse = await fetch(`${API_URL}/users/token/refresh/`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ refresh: refreshToken }),
            });

            if (refreshResponse.ok) {
              const refreshData = await refreshResponse.json();
              localStorage.setItem('access_token', refreshData.access);
              return fetchProducts();
            }
          }
        }
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText || 'Failed to fetch products'}`);
      }

      const data: ProductListResponse = await response.json();
      setProducts(data.results || []);
      setTotalCount(data.count || 0);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load products';
      setError(message);
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, debouncedSearch, API_URL]);

  const totalPages = Math.ceil(totalCount / pageSize);

  const getBadgeColor = (badge: string) => {
    switch (badge) {
      case 'Hot':
        return 'bg-red-100 text-red-700';
      case 'New':
        return 'bg-green-100 text-green-700';
      case 'Sale':
        return 'bg-orange-100 text-orange-700';
      default:
        return '';
    }
  };

  return (
    <>
      <div className="mb-6 lg:mb-8">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2 tracking-tight">
          Products
        </h1>
        <p className="text-sm sm:text-base text-gray-600 font-medium">
          Manage your product inventory and details.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6 lg:mb-8">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
          <div className="flex items-center gap-1.5 mb-1">
            <Package size={14} className="text-blue-700" />
            <p className="text-xs text-blue-700 font-semibold">Total Products</p>
          </div>
          <p className="text-xl lg:text-2xl font-bold text-blue-900">{totalCount}</p>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
          <div className="flex items-center gap-1.5 mb-1">
            <CheckCircle2 size={14} className="text-green-700" />
            <p className="text-xs text-green-700 font-semibold">In Stock</p>
          </div>
          <p className="text-xl lg:text-2xl font-bold text-green-900">
            {products.filter((p) => p.in_stock).length}
          </p>
        </div>
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 border border-orange-200">
          <div className="flex items-center gap-1.5 mb-1">
            <XCircle size={14} className="text-orange-700" />
            <p className="text-xs text-orange-700 font-semibold">Out of Stock</p>
          </div>
          <p className="text-xl lg:text-2xl font-bold text-orange-900">
            {products.filter((p) => !p.in_stock).length}
          </p>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
          <div className="flex items-center gap-1.5 mb-1">
            <TrendingUp size={14} className="text-purple-700" />
            <p className="text-xs text-purple-700 font-semibold">Total Sold</p>
          </div>
          <p className="text-xl lg:text-2xl font-bold text-purple-900">
            {products.reduce((sum, p) => sum + p.sold_count, 0)}
          </p>
        </div>
      </div>

      {/* Search and Add Button */}
      <div className="mb-6 lg:mb-8">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search
              className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Search by name or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-2.5 bg-white rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all text-sm"
            />
          </div>
          <button className="flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors whitespace-nowrap">
            <Plus size={18} />
            Add Product
          </button>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="mb-6 flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader className="w-8 h-8 text-blue-600 animate-spin mb-3" />
          <p className="text-gray-600">Loading products...</p>
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 text-lg">No products found</p>
          {debouncedSearch && <p className="text-gray-500 text-sm mt-2">Try adjusting your search</p>}
        </div>
      ) : (
        <>
          {/* Products Table */}
          <div className="space-y-3 mb-8">
            {products.map((product) => (
              <div key={product.id} className="bg-white rounded-lg border border-gray-100 overflow-hidden hover:shadow-md transition-all">
                <div className="p-4 flex flex-col sm:flex-row gap-4">
                  {/* Product Image */}
                  <div className="flex-shrink-0">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-20 h-20 rounded-lg object-cover bg-gray-100"
                    />
                  </div>

                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-2 mb-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 truncate">{product.name}</p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          Category: <span className="font-medium">{product.category.name}</span>
                        </p>
                      </div>
                      {product.badge && (
                        <span
                          className={`text-xs font-bold px-2 py-1 rounded-full whitespace-nowrap flex-shrink-0 ${getBadgeColor(
                            product.badge
                          )}`}
                        >
                          {product.badge}
                        </span>
                      )}
                    </div>

                    {/* Rating */}
                    {product.avg_rating > 0 && (
                      <div className="flex items-center gap-1 text-xs mt-2">
                        <Star size={12} className="fill-yellow-400 text-yellow-400" />
                        <span className="text-gray-700">
                          {product.avg_rating} ({product.total_reviews} reviews)
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Price and Status (hidden on mobile) */}
                  <div className="hidden sm:flex flex-col items-end gap-2">
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900">R{product.price}</p>
                      {product.old_price && (
                        <p className="text-xs line-through text-gray-500">R{product.old_price}</p>
                      )}
                      {product.discount_percentage > 0 && (
                        <p className="text-xs text-red-600 font-semibold">
                          {Math.round(product.discount_percentage)}% off
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500 mb-0.5">Status</p>
                      <div className="flex items-center gap-1 justify-end">
                        {product.in_stock ? (
                          <>
                            <CheckCircle2 size={14} className="text-green-600" />
                            <span className="text-xs font-medium text-green-600">In Stock</span>
                          </>
                        ) : (
                          <>
                            <XCircle size={14} className="text-red-600" />
                            <span className="text-xs font-medium text-red-600">Out of Stock</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 flex-shrink-0">
                    <button className="p-2 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                      <Edit2 size={16} />
                    </button>
                    <button className="p-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* Mobile Details */}
                <div className="sm:hidden px-4 pb-3 flex gap-4 text-xs border-t border-gray-50">
                  <div>
                    <p className="text-gray-500 mb-1">Price</p>
                    <p className="font-bold text-gray-900">R{product.price}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 mb-1">Status</p>
                    <p className={`font-bold ${product.in_stock ? 'text-green-600' : 'text-red-600'}`}>
                      {product.in_stock ? 'In Stock' : 'Out of Stock'}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 mb-1">Sold</p>
                    <p className="font-bold text-gray-900">{product.sold_count}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Info and Controls */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-gray-600">
              Showing <span className="font-semibold">{(currentPage - 1) * pageSize + 1}</span> to{' '}
              <span className="font-semibold">{Math.min(currentPage * pageSize, totalCount)}</span> of{' '}
              <span className="font-semibold">{totalCount}</span> products
            </div>

            {totalPages > 1 && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  title="Previous page"
                >
                  <ChevronLeft size={18} className="text-gray-600" />
                </button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`min-w-10 h-10 rounded-lg font-medium transition-all ${
                        currentPage === page
                          ? 'bg-blue-600 text-white'
                          : 'border border-gray-200 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  title="Next page"
                >
                  <ChevronRight size={18} className="text-gray-600" />
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
};

export default Products;
