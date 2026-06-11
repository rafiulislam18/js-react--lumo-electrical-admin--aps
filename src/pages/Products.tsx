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
  SlidersHorizontal,
  ArrowUpDown,
} from 'lucide-react';
import ProductDetailModal from '../components/ProductDetailModal';
import EditProductModal from '../components/EditProductModal';

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

interface ProductStats {
  total: number;
  in_stock: number;
  out_of_stock: number;
  total_sold: number;
}

interface ProductListResponse {
  count: number;
  page: number;
  page_size: number;
  stats: ProductStats;
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
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [editProductId, setEditProductId] = useState<number | null>(null);
  const [stockFilter, setStockFilter] = useState<'all' | 'in_stock' | 'out_of_stock'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'price_high' | 'price_low' | 'popular'>('newest');
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [showSortMenu, setShowSortMenu] = useState(false);

  // Stats locked at initial load — not affected by search or pagination
  const [stats, setStats] = useState<ProductStats | null>(null);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.filter-menu-container') && !target.closest('.sort-menu-container')) {
        setShowFilterMenu(false);
        setShowSortMenu(false);
      }
    };

    if (showFilterMenu || showSortMenu) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showFilterMenu, showSortMenu]);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch products whenever page, page size, search, filter, or sort changes
  useEffect(() => {
    fetchProducts();
  }, [currentPage, pageSize, debouncedSearch, stockFilter, sortBy]);

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

      if (stockFilter !== 'all') {
        params.append('stock', stockFilter);
      }

      // Map UI sort options to backend ordering parameter
      const orderingMap: Record<string, string> = {
        newest: '-created_at',
        oldest: 'created_at',
        price_high: '-price',
        price_low: 'price',
        popular: '-sold_count',
      };
      params.append('ordering', orderingMap[sortBy]);

      const response = await authenticatedFetch(`/products/admin/list/?${params}`);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText || 'Failed to fetch products'}`);
      }

      const data: ProductListResponse = await response.json();
      setProducts(data.results || []);
      setTotalCount(data.count || 0);
      if (!stats && data.stats) setStats(data.stats);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load products';
      setError(message);
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, debouncedSearch, stockFilter, sortBy]);

  const totalPages = Math.ceil(totalCount / pageSize);

  const getBadgeStyle = (badge: string) => {
    switch (badge) {
      case 'Hot':
        return 'text-neg bg-neg/[.13] border border-neg/[.28]';
      case 'New':
        return 'text-info bg-info/[.13] border border-info/[.28]';
      case 'Sale':
        return 'text-accent bg-accent/[.13] border border-accent/[.28]';
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
      {/* Page header — terminal status bar */}
      <div className="flex items-center justify-between gap-4 flex-wrap mb-[18px]">
        <div className="flex items-center gap-[11px]">
          <span className="w-[7px] h-[7px] rounded-full bg-pos shadow-[0_0_8px_#5fcf80]" />
          <h1 className="m-0 font-mono text-base font-semibold tracking-[.12em] uppercase text-body">
            Products
          </h1>
          <span className="font-mono text-[11.5px] text-mute tracking-[.04em]">// catalogue</span>
        </div>
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => navigate('/products/create')}
            className="inline-flex items-center justify-center gap-[7px] px-3.5 py-2 text-[12.5px] font-bold rounded-[7px] bg-accent text-accent-ink border border-accent hover:brightness-110 transition whitespace-nowrap"
          >
            <Plus size={14} />
            Add Product
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6 lg:mb-8">
        <div className="bg-panel border border-line rounded-card px-4 py-3.5 min-w-0">
          <div className="flex items-center justify-between mb-2.5">
            <span className="font-mono text-[10.5px] tracking-[.12em] uppercase text-mute">Total</span>
            <Package size={14} className="text-mute" />
          </div>
          <p className="font-mono text-[26px] font-semibold text-body tracking-[-.02em] leading-none">{stats?.total ?? '—'}</p>
          <p className="mt-2 font-mono text-[11px] text-mute">products</p>
        </div>
        <div className="bg-panel border border-line rounded-card px-4 py-3.5 min-w-0">
          <div className="flex items-center justify-between mb-2.5">
            <span className="font-mono text-[10.5px] tracking-[.12em] uppercase text-mute">In Stock</span>
            <CheckCircle2 size={14} className="text-pos" />
          </div>
          <p className="font-mono text-[26px] font-semibold text-pos tracking-[-.02em] leading-none">{stats?.in_stock ?? '—'}</p>
          <p className="mt-2 font-mono text-[11px] text-mute">available</p>
        </div>
        <div className="bg-panel border border-line rounded-card px-4 py-3.5 min-w-0">
          <div className="flex items-center justify-between mb-2.5">
            <span className="font-mono text-[10.5px] tracking-[.12em] uppercase text-mute">Out of Stock</span>
            <XCircle size={14} className="text-neg" />
          </div>
          <p className="font-mono text-[26px] font-semibold text-neg tracking-[-.02em] leading-none">{stats?.out_of_stock ?? '—'}</p>
          <p className="mt-2 font-mono text-[11px] text-mute">unavailable</p>
        </div>
        <div className="bg-panel border border-line rounded-card px-4 py-3.5 min-w-0">
          <div className="flex items-center justify-between mb-2.5">
            <span className="font-mono text-[10.5px] tracking-[.12em] uppercase text-mute">Sold</span>
            <TrendingUp size={14} className="text-accent" />
          </div>
          <p className="font-mono text-[26px] font-semibold text-accent tracking-[-.02em] leading-none">{stats?.total_sold ?? '—'}</p>
          <p className="mt-2 font-mono text-[11px] text-mute">total units</p>
        </div>
      </div>

      {/* Search + Filter + Sort */}
      <div className="mb-6 lg:mb-8">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative flex items-center">
            <Search className="absolute left-2.5 text-mute pointer-events-none" size={14} />
            <input
              type="text"
              placeholder="Search by name or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-panel border border-line rounded-[7px] pl-8 pr-3 py-2 text-[12.5px] text-body outline-none focus:border-accent/50 placeholder:text-mute transition-colors"
            />
          </div>

          {/* Filter Menu */}
          <div className="relative filter-menu-container">
            <button
              type="button"
              onClick={() => setShowFilterMenu(!showFilterMenu)}
              className={`inline-flex items-center justify-center gap-[7px] px-3.5 py-2 rounded-[7px] border text-[12.5px] font-bold transition whitespace-nowrap ${
                showFilterMenu || stockFilter !== 'all'
                  ? 'bg-accent/15 text-accent border-accent/40'
                  : 'bg-panel text-dim border-line hover:border-[#3a3d44] hover:text-body'
              }`}
            >
              <SlidersHorizontal size={14} />
              <span>Filter</span>
            </button>
            {showFilterMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-panel border border-line rounded-card shadow-[0_20px_50px_-12px_rgba(0,0,0,.87)] z-20 animate-pop">
                <div className="p-3 space-y-3">
                  <div>
                    <label className="font-mono text-[10.5px] tracking-[.12em] uppercase text-mute mb-2 block">
                      Stock Status
                    </label>
                    <div className="space-y-1.5">
                      <button
                        onClick={() => {
                          setStockFilter('all');
                          setCurrentPage(1);
                          setShowFilterMenu(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-[7px] text-[12.5px] border transition-colors ${
                          stockFilter === 'all'
                            ? 'bg-accent/15 text-accent border-accent/30'
                            : 'bg-panel2 text-dim border-transparent hover:text-body'
                        }`}
                      >
                        All Products
                      </button>
                      <button
                        onClick={() => {
                          setStockFilter('in_stock');
                          setCurrentPage(1);
                          setShowFilterMenu(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-[7px] text-[12.5px] border transition-colors ${
                          stockFilter === 'in_stock'
                            ? 'bg-accent/15 text-accent border-accent/30'
                            : 'bg-panel2 text-dim border-transparent hover:text-body'
                        }`}
                      >
                        In Stock
                      </button>
                      <button
                        onClick={() => {
                          setStockFilter('out_of_stock');
                          setCurrentPage(1);
                          setShowFilterMenu(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-[7px] text-[12.5px] border transition-colors ${
                          stockFilter === 'out_of_stock'
                            ? 'bg-accent/15 text-accent border-accent/30'
                            : 'bg-panel2 text-dim border-transparent hover:text-body'
                        }`}
                      >
                        Out of Stock
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sort Menu */}
          <div className="relative sort-menu-container">
            <button
              type="button"
              onClick={() => setShowSortMenu(!showSortMenu)}
              className={`inline-flex items-center justify-center gap-[7px] px-3.5 py-2 rounded-[7px] border text-[12.5px] font-bold transition whitespace-nowrap ${
                showSortMenu || sortBy !== 'newest'
                  ? 'bg-accent/15 text-accent border-accent/40'
                  : 'bg-panel text-dim border-line hover:border-[#3a3d44] hover:text-body'
              }`}
            >
              <ArrowUpDown size={14} />
              <span>Sort</span>
            </button>
            {showSortMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-panel border border-line rounded-card shadow-[0_20px_50px_-12px_rgba(0,0,0,.87)] z-20 animate-pop">
                <div className="p-3 space-y-3">
                  <div>
                    <label className="font-mono text-[10.5px] tracking-[.12em] uppercase text-mute mb-2 block">
                      Sort By
                    </label>
                    <div className="space-y-1.5">
                      <button
                        onClick={() => {
                          setSortBy('newest');
                          setCurrentPage(1);
                          setShowSortMenu(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-[7px] text-[12.5px] border transition-colors ${
                          sortBy === 'newest'
                            ? 'bg-accent/15 text-accent border-accent/30'
                            : 'bg-panel2 text-dim border-transparent hover:text-body'
                        }`}
                      >
                        Date: Newest First
                      </button>
                      <button
                        onClick={() => {
                          setSortBy('oldest');
                          setCurrentPage(1);
                          setShowSortMenu(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-[7px] text-[12.5px] border transition-colors ${
                          sortBy === 'oldest'
                            ? 'bg-accent/15 text-accent border-accent/30'
                            : 'bg-panel2 text-dim border-transparent hover:text-body'
                        }`}
                      >
                        Date: Oldest First
                      </button>
                      <button
                        onClick={() => {
                          setSortBy('price_high');
                          setCurrentPage(1);
                          setShowSortMenu(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-[7px] text-[12.5px] border transition-colors ${
                          sortBy === 'price_high'
                            ? 'bg-accent/15 text-accent border-accent/30'
                            : 'bg-panel2 text-dim border-transparent hover:text-body'
                        }`}
                      >
                        Price: High to Low
                      </button>
                      <button
                        onClick={() => {
                          setSortBy('price_low');
                          setCurrentPage(1);
                          setShowSortMenu(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-[7px] text-[12.5px] border transition-colors ${
                          sortBy === 'price_low'
                            ? 'bg-accent/15 text-accent border-accent/30'
                            : 'bg-panel2 text-dim border-transparent hover:text-body'
                        }`}
                      >
                        Price: Low to High
                      </button>
                      <button
                        onClick={() => {
                          setSortBy('popular');
                          setCurrentPage(1);
                          setShowSortMenu(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-[7px] text-[12.5px] border transition-colors ${
                          sortBy === 'popular'
                            ? 'bg-accent/15 text-accent border-accent/30'
                            : 'bg-panel2 text-dim border-transparent hover:text-body'
                        }`}
                      >
                        Most Popular
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="mb-6 flex items-center gap-3 p-4 bg-neg/10 border border-neg/30 rounded-card">
          <AlertCircle className="w-5 h-5 text-neg flex-shrink-0" />
          <p className="text-sm text-neg">{error}</p>
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader className="w-6 h-6 text-accent animate-spin mb-3" />
          <p className="font-mono text-xs text-mute uppercase tracking-[.1em]">Loading products…</p>
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-[54px] text-mute">
          <Package size={30} className="mx-auto opacity-50" />
          <p className="mt-3 text-[13.5px] font-semibold text-dim">No products found</p>
          {debouncedSearch && <p className="mt-1 text-xs">Try adjusting your search</p>}
        </div>
      ) : (
        <>
          {/* Products Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 mb-8">
            {products.map((product) => (
              <div
                key={product.id}
                className="group relative flex flex-col overflow-hidden rounded-card border border-line bg-panel transition-colors hover:border-[#3a3d44]"
              >
                {/* Square Image */}
                <button
                  onClick={() => setSelectedProductId(product.id)}
                  className="relative h-36 sm:h-40 overflow-hidden bg-panel2 w-full text-left border-b border-line"
                >
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />

                  {/* Badge - top left */}
                  {product.badge && (
                    <div className="absolute top-2 left-2 z-10">
                      <span
                        className={`inline-flex items-center font-mono text-[10px] font-semibold uppercase tracking-[.05em] px-2 py-[3px] rounded-[5px] backdrop-blur bg-bg/70 ${getBadgeStyle(product.badge)}`}
                      >
                        {product.badge}
                      </span>
                    </div>
                  )}

                  {/* Stock pill - top right */}
                  <div className="absolute top-2 right-2 z-10">
                    {product.in_stock ? (
                      <span className="inline-flex items-center gap-[5px] font-mono text-[10px] font-semibold uppercase tracking-[.05em] px-2 py-[3px] rounded-[5px] text-pos bg-bg/70 backdrop-blur border border-pos/[.28]">
                        <CheckCircle2 size={9} />
                        In Stock
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-[5px] font-mono text-[10px] font-semibold uppercase tracking-[.05em] px-2 py-[3px] rounded-[5px] text-neg bg-bg/70 backdrop-blur border border-neg/[.28]">
                        <XCircle size={9} />
                        Out
                      </span>
                    )}
                  </div>

                  {/* Discount pill - bottom left */}
                  {product.discount_percentage > 0 && (
                    <div className="absolute bottom-2 left-2 z-10">
                      <span className="inline-flex items-center font-mono text-[10.5px] font-bold px-2 py-[3px] rounded-[5px] text-accent bg-bg/70 backdrop-blur border border-accent/[.28]">
                        -{Math.round(product.discount_percentage)}%
                      </span>
                    </div>
                  )}

                  {/* Action buttons - overlay on hover */}
                  <div className="absolute bottom-2 right-2 z-10 flex gap-1.5 opacity-0 translate-y-1 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditProductId(product.id);
                      }}
                      className="w-8 h-8 rounded-[7px] flex items-center justify-center bg-bg/80 backdrop-blur border border-line text-dim hover:text-accent hover:border-accent/40 transition-colors"
                      title="Edit product"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteConfirm({ id: product.id, name: product.name });
                      }}
                      className="w-8 h-8 rounded-[7px] flex items-center justify-center bg-bg/80 backdrop-blur border border-line text-dim hover:text-neg hover:border-neg/40 transition-colors"
                      title="Delete product"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </button>

                {/* Info Section */}
                <div className="relative flex flex-col flex-1 p-3">
                  {/* Category */}
                  <p className="font-mono text-[10px] tracking-[.12em] uppercase text-mute mb-1 truncate">
                    {product.category.name}
                  </p>

                  {/* Name */}
                  <button
                    onClick={() => setSelectedProductId(product.id)}
                    className="font-semibold text-body text-xs leading-snug mb-1.5 line-clamp-2 min-h-[2rem] text-left hover:text-accent transition-colors"
                  >
                    {product.name}
                  </button>

                  {/* Rating */}
                  <div className="flex items-center gap-1.5 mb-2 min-h-[1rem]">
                    {product.avg_rating > 0 ? (
                      <>
                        <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-[5px] bg-warn/[.13] border border-warn/[.28]">
                          <Star size={10} className="fill-warn text-warn" />
                          <span className="font-mono text-[10.5px] font-bold text-warn">{product.avg_rating}</span>
                        </div>
                        <span className="font-mono text-[10.5px] text-mute">
                          ({product.total_reviews})
                        </span>
                      </>
                    ) : (
                      <span className="text-[0.7rem] text-mute italic">No reviews yet</span>
                    )}
                  </div>

                  {/* Price + Sold count - bottom row */}
                  <div className="mt-auto flex items-end justify-between gap-1 pt-2 border-t border-line">
                    <div className="min-w-0">
                      <div className="flex items-baseline gap-1 flex-wrap">
                        <span className="font-mono text-sm font-bold text-accent tracking-tight">R{product.price}</span>
                        {product.old_price && (
                          <span className="font-mono text-[10.5px] line-through text-mute">R{product.old_price}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 font-mono text-[10.5px] text-dim whitespace-nowrap">
                      <TrendingUp size={10} className="text-pos" />
                      <span>{product.sold_count} sold</span>
                    </div>
                  </div>

                  {/* Mobile actions - always visible on small screens */}
                  <div className="sm:hidden flex gap-2 mt-2">
                    <button
                      onClick={() => setEditProductId(product.id)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 text-accent bg-accent/10 rounded-[7px] hover:bg-accent/20 transition-colors border border-accent/[.28] text-xs font-bold"
                    >
                      <Edit2 size={12} />
                      Edit
                    </button>
                    <button
                      onClick={() => setDeleteConfirm({ id: product.id, name: product.name })}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 text-neg bg-neg/10 rounded-[7px] hover:bg-neg/20 transition-colors border border-neg/[.28] text-xs font-bold"
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
            <div className="font-mono text-xs text-mute">
              Showing <span className="font-semibold text-body">{(currentPage - 1) * pageSize + 1}</span> to{' '}
              <span className="font-semibold text-body">{Math.min(currentPage * pageSize, totalCount)}</span> of{' '}
              <span className="font-semibold text-body">{totalCount}</span> products
            </div>

            {totalPages > 1 && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="w-8 h-8 rounded-[7px] flex items-center justify-center bg-panel border border-line text-dim hover:text-body hover:border-[#3a3d44] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  title="Previous page"
                >
                  <ChevronLeft size={16} />
                </button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`min-w-8 h-8 px-2 rounded-[7px] font-mono text-xs font-bold transition-colors ${
                        currentPage === page
                          ? 'bg-accent text-accent-ink border border-accent'
                          : 'border border-line bg-panel text-dim hover:text-body hover:border-[#3a3d44]'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="w-8 h-8 rounded-[7px] flex items-center justify-center bg-panel border border-line text-dim hover:text-body hover:border-[#3a3d44] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  title="Next page"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </div>
        </>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 animate-fade">
          <div className="w-full max-w-sm bg-panel border border-line rounded-card shadow-[0_30px_80px_-20px_rgba(0,0,0,.87)] overflow-hidden animate-pop">
            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-line">
              <div className="w-9 h-9 rounded-lg bg-neg/15 text-neg flex items-center justify-center shrink-0">
                <Trash2 size={17} />
              </div>
              <span className="font-mono font-semibold text-sm tracking-[.08em] uppercase text-body">Delete Product</span>
            </div>
            <div className="p-4">
              <p className="text-sm text-dim">
                Are you sure you want to delete <span className="font-semibold text-body">{deleteConfirm.name}</span>? This action cannot be undone.
              </p>
            </div>
            <div className="px-4 py-3 border-t border-line flex justify-end gap-2.5">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="inline-flex items-center justify-center gap-[7px] px-3.5 py-2 text-[12.5px] font-bold rounded-[7px] bg-panel text-dim border border-line hover:border-[#3a3d44] hover:text-body transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteProduct}
                disabled={deleting}
                className="inline-flex items-center justify-center gap-[7px] px-3.5 py-2 text-[12.5px] font-bold rounded-[7px] text-neg bg-neg/15 border border-neg/40 hover:bg-neg/25 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deleting ? (
                  <>
                    <Loader size={14} className="animate-spin" />
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

      {/* Product Detail Modal */}
      {selectedProductId !== null && (
        <ProductDetailModal
          productId={selectedProductId}
          onClose={() => setSelectedProductId(null)}
        />
      )}

      {/* Edit Product Modal */}
      {editProductId !== null && (
        <EditProductModal
          productId={editProductId}
          onClose={() => setEditProductId(null)}
          onSaved={() => {
            setEditProductId(null);
            fetchProducts();
          }}
        />
      )}
    </>
  );
};

export default Products;
