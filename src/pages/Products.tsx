import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { authenticatedFetch, apiDelete } from '../lib/api';
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
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: number; name: string } | null>(null);
  const [deleting, setDeleting] = useState(false);

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

      const params = new URLSearchParams({
        page: currentPage.toString(),
        page_size: pageSize.toString(),
      });

      if (debouncedSearch) {
        params.append('search', debouncedSearch);
      }

      const response = await authenticatedFetch(`/products/admin/list/?${params}`);

      if (!response.ok) {
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
  }, [currentPage, pageSize, debouncedSearch]);

  const totalPages = Math.ceil(totalCount / pageSize);

  const getBadgeStyle = (badge: string) => {
    switch (badge) {
      case 'Hot':
        return 'bg-gradient-to-br from-red-500 to-rose-600 text-white shadow-lg shadow-red-500/40 ring-1 ring-red-300/40';
      case 'New':
        return 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/40 ring-1 ring-emerald-300/40';
      case 'Sale':
        return 'bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-500/40 ring-1 ring-amber-300/40';
      default:
        return '';
    }
  };

  const handleDeleteProduct = async () => {
    if (!deleteConfirm) return;

    try {
      setDeleting(true);
      await apiDelete(`/products/${deleteConfirm.id}/`);
      setDeleteConfirm(null);
      fetchProducts();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete product';
      setError(message);
      console.error('Delete error:', err);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <div className="mb-6 lg:mb-8">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2 tracking-tight">
          Products
        </h1>
        <p className="text-sm sm:text-base text-slate-400 font-medium">
          Manage your product inventory and details.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6 lg:mb-8">
        <div className="group relative overflow-hidden rounded-2xl border border-slate-700/60 bg-slate-800/40 backdrop-blur p-4 transition-all duration-300 hover:border-cyan-400/40 hover:shadow-lg hover:shadow-cyan-500/10">
          <div className="pointer-events-none absolute -top-8 -right-8 h-24 w-24 rounded-full bg-cyan-500/15 blur-2xl transition-opacity group-hover:opacity-100" />
          <div className="relative flex items-center justify-between mb-2">
            <div className="rounded-lg bg-cyan-500/15 p-2 ring-1 ring-cyan-400/20">
              <Package size={16} className="text-cyan-300" />
            </div>
            <span className="text-[0.65rem] font-semibold uppercase tracking-wider text-slate-500">Total</span>
          </div>
          <p className="relative text-2xl lg:text-3xl font-bold text-white tracking-tight">{totalCount}</p>
          <p className="relative mt-0.5 text-xs font-medium text-slate-400">Products</p>
        </div>
        <div className="group relative overflow-hidden rounded-2xl border border-slate-700/60 bg-slate-800/40 backdrop-blur p-4 transition-all duration-300 hover:border-emerald-400/40 hover:shadow-lg hover:shadow-emerald-500/10">
          <div className="pointer-events-none absolute -top-8 -right-8 h-24 w-24 rounded-full bg-emerald-500/15 blur-2xl" />
          <div className="relative flex items-center justify-between mb-2">
            <div className="rounded-lg bg-emerald-500/15 p-2 ring-1 ring-emerald-400/20">
              <CheckCircle2 size={16} className="text-emerald-300" />
            </div>
            <span className="text-[0.65rem] font-semibold uppercase tracking-wider text-slate-500">In Stock</span>
          </div>
          <p className="relative text-2xl lg:text-3xl font-bold text-white tracking-tight">
            {products.filter((p) => p.in_stock).length}
          </p>
          <p className="relative mt-0.5 text-xs font-medium text-slate-400">Available</p>
        </div>
        <div className="group relative overflow-hidden rounded-2xl border border-slate-700/60 bg-slate-800/40 backdrop-blur p-4 transition-all duration-300 hover:border-amber-400/40 hover:shadow-lg hover:shadow-amber-500/10">
          <div className="pointer-events-none absolute -top-8 -right-8 h-24 w-24 rounded-full bg-amber-500/15 blur-2xl" />
          <div className="relative flex items-center justify-between mb-2">
            <div className="rounded-lg bg-amber-500/15 p-2 ring-1 ring-amber-400/20">
              <XCircle size={16} className="text-amber-300" />
            </div>
            <span className="text-[0.65rem] font-semibold uppercase tracking-wider text-slate-500">Out of Stock</span>
          </div>
          <p className="relative text-2xl lg:text-3xl font-bold text-white tracking-tight">
            {products.filter((p) => !p.in_stock).length}
          </p>
          <p className="relative mt-0.5 text-xs font-medium text-slate-400">Unavailable</p>
        </div>
        <div className="group relative overflow-hidden rounded-2xl border border-slate-700/60 bg-slate-800/40 backdrop-blur p-4 transition-all duration-300 hover:border-sky-400/40 hover:shadow-lg hover:shadow-sky-500/10">
          <div className="pointer-events-none absolute -top-8 -right-8 h-24 w-24 rounded-full bg-sky-500/15 blur-2xl" />
          <div className="relative flex items-center justify-between mb-2">
            <div className="rounded-lg bg-sky-500/15 p-2 ring-1 ring-sky-400/20">
              <TrendingUp size={16} className="text-sky-300" />
            </div>
            <span className="text-[0.65rem] font-semibold uppercase tracking-wider text-slate-500">Sold</span>
          </div>
          <p className="relative text-2xl lg:text-3xl font-bold text-white tracking-tight">
            {products.reduce((sum, p) => sum + p.sold_count, 0)}
          </p>
          <p className="relative mt-0.5 text-xs font-medium text-slate-400">Total Units</p>
        </div>
      </div>

      {/* Search and Add Button */}
      <div className="mb-6 lg:mb-8">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search
              className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 z-10"
              size={18}
            />
            <input
              type="text"
              placeholder="Search by name or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-2.5 bg-slate-800/60 backdrop-blur rounded-xl border border-slate-700 text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-400/60 focus:outline-none transition-all text-sm"
            />
          </div>
          <button
            onClick={() => navigate('/products/create')}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-br from-cyan-500 to-emerald-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-cyan-500/30 transition-all whitespace-nowrap"
          >
            <Plus size={18} />
            Add Product
          </button>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="mb-6 flex items-center gap-3 p-4 bg-red-500/10 border border-red-400/30 rounded-xl backdrop-blur">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
          <p className="text-sm text-red-300">{error}</p>
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader className="w-8 h-8 text-cyan-400 animate-spin mb-3" />
          <p className="text-slate-400">Loading products...</p>
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-12">
          <Package className="w-12 h-12 mx-auto mb-3 text-slate-600" />
          <p className="text-slate-300 text-lg">No products found</p>
          {debouncedSearch && <p className="text-slate-500 text-sm mt-2">Try adjusting your search</p>}
        </div>
      ) : (
        <>
          {/* Products Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 mb-8">
            {products.map((product) => (
              <div
                key={product.id}
                className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-700/60 bg-slate-800/40 backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:border-cyan-400/40 hover:shadow-2xl hover:shadow-cyan-500/10"
              >
                {/* Top accent line on hover */}
                <div className="pointer-events-none absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent opacity-0 transition-opacity group-hover:opacity-100 z-20" />

                {/* Square Image */}
                <div className="relative h-36 sm:h-40 overflow-hidden bg-slate-900/60">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />

                  {/* Gradient overlay for badge readability */}
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/40 opacity-60" />

                  {/* Badge - top left */}
                  {product.badge && (
                    <div className="absolute top-2 left-2 z-10">
                      <span
                        className={`inline-flex items-center text-[0.6rem] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded ${getBadgeStyle(product.badge)}`}
                      >
                        {product.badge}
                      </span>
                    </div>
                  )}

                  {/* Stock pill - top right */}
                  <div className="absolute top-2 right-2 z-10">
                    {product.in_stock ? (
                      <span className="inline-flex items-center gap-0.5 text-[0.6rem] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/90 text-white backdrop-blur ring-1 ring-emerald-300/40">
                        <CheckCircle2 size={9} />
                        In Stock
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-0.5 text-[0.6rem] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-red-500/90 text-white backdrop-blur ring-1 ring-red-300/40">
                        <XCircle size={9} />
                        Out
                      </span>
                    )}
                  </div>

                  {/* Discount pill - bottom left */}
                  {product.discount_percentage > 0 && (
                    <div className="absolute bottom-2 left-2 z-10">
                      <span className="inline-flex items-center text-[0.65rem] font-extrabold px-2 py-0.5 rounded bg-gradient-to-br from-pink-500 to-rose-600 text-white ring-1 ring-pink-300/40">
                        -{Math.round(product.discount_percentage)}%
                      </span>
                    </div>
                  )}

                  {/* Action buttons - overlay on hover */}
                  <div className="absolute bottom-2 right-2 z-10 flex gap-1.5 opacity-0 translate-y-1 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0">
                    <button
                      onClick={() => navigate(`/products/${product.id}/edit`)}
                      className="p-2 text-white bg-cyan-500/90 backdrop-blur rounded-lg hover:bg-cyan-500 transition-colors ring-1 ring-cyan-300/40 shadow-lg shadow-cyan-500/30"
                      title="Edit product"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => setDeleteConfirm({ id: product.id, name: product.name })}
                      className="p-2 text-white bg-red-500/90 backdrop-blur rounded-lg hover:bg-red-500 transition-colors ring-1 ring-red-300/40 shadow-lg shadow-red-500/30"
                      title="Delete product"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* Info Section */}
                <div className="relative flex flex-col flex-1 p-3">
                  {/* Category */}
                  <p className="text-[0.6rem] font-bold uppercase tracking-wider text-cyan-300/80 mb-1">
                    {product.category.name}
                  </p>

                  {/* Name */}
                  <h3 className="font-semibold text-white text-xs leading-snug mb-1.5 line-clamp-2 min-h-[2rem]">
                    {product.name}
                  </h3>

                  {/* Rating */}
                  <div className="flex items-center gap-1.5 mb-2 min-h-[1rem]">
                    {product.avg_rating > 0 ? (
                      <>
                        <div className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-amber-500/15 ring-1 ring-amber-400/20">
                          <Star size={10} className="fill-amber-400 text-amber-400" />
                          <span className="text-[0.7rem] font-bold text-amber-300">{product.avg_rating}</span>
                        </div>
                        <span className="text-[0.7rem] text-slate-500 font-medium">
                          ({product.total_reviews})
                        </span>
                      </>
                    ) : (
                      <span className="text-[0.7rem] text-slate-600 font-medium italic">No reviews yet</span>
                    )}
                  </div>

                  {/* Price + Sold count - bottom row */}
                  <div className="mt-auto flex items-end justify-between gap-1 pt-2 border-t border-slate-700/50">
                    <div className="min-w-0">
                      <div className="flex items-baseline gap-1 flex-wrap">
                        <span className="text-sm font-bold text-white tracking-tight">R{product.price}</span>
                        {product.old_price && (
                          <span className="text-[0.65rem] line-through text-slate-500">R{product.old_price}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-0.5 text-[0.65rem] font-semibold text-slate-400 whitespace-nowrap">
                      <TrendingUp size={10} className="text-sky-400" />
                      <span>{product.sold_count} sold</span>
                    </div>
                  </div>

                  {/* Mobile actions - always visible on small screens */}
                  <div className="sm:hidden flex gap-2 mt-2">
                    <button
                      onClick={() => navigate(`/products/${product.id}/edit`)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 text-cyan-300 bg-cyan-500/15 rounded-lg hover:bg-cyan-500/25 transition-colors ring-1 ring-cyan-400/20 text-xs font-semibold"
                    >
                      <Edit2 size={12} />
                      Edit
                    </button>
                    <button
                      onClick={() => setDeleteConfirm({ id: product.id, name: product.name })}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 text-red-300 bg-red-500/15 rounded-lg hover:bg-red-500/25 transition-colors ring-1 ring-red-400/20 text-xs font-semibold"
                    >
                      <Trash2 size={12} />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Info and Controls */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-slate-400">
              Showing <span className="font-semibold text-slate-200">{(currentPage - 1) * pageSize + 1}</span> to{' '}
              <span className="font-semibold text-slate-200">{Math.min(currentPage * pageSize, totalCount)}</span> of{' '}
              <span className="font-semibold text-slate-200">{totalCount}</span> products
            </div>

            {totalPages > 1 && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg border border-slate-700 bg-slate-800/60 hover:bg-slate-700/60 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  title="Previous page"
                >
                  <ChevronLeft size={18} className="text-slate-300" />
                </button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`min-w-10 h-10 rounded-lg font-medium transition-all ${
                        currentPage === page
                          ? 'bg-gradient-to-br from-cyan-500 to-emerald-600 text-white shadow-md shadow-cyan-500/30'
                          : 'border border-slate-700 bg-slate-800/60 text-slate-300 hover:bg-slate-700/60 hover:text-white'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg border border-slate-700 bg-slate-800/60 hover:bg-slate-700/60 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  title="Next page"
                >
                  <ChevronRight size={18} className="text-slate-300" />
                </button>
              </div>
            )}
          </div>
        </>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl max-w-sm w-full p-6 shadow-xl backdrop-blur">
            <h3 className="text-lg font-bold text-white mb-2">Delete Product</h3>
            <p className="text-sm text-slate-300 mb-6">
              Are you sure you want to delete <span className="font-semibold text-white">{deleteConfirm.name}</span>? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-2.5 bg-slate-700/60 text-slate-200 rounded-lg font-semibold hover:bg-slate-700 transition-colors border border-slate-600"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteProduct}
                disabled={deleting}
                className="flex-1 px-4 py-2.5 bg-red-600/80 text-white rounded-lg font-semibold hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {deleting ? (
                  <>
                    <Loader size={16} className="animate-spin" />
                    Deleting...
                  </>
                ) : (
                  'Delete'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Products;
