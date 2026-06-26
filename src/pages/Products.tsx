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
  ChevronDown,
  ArrowUpDown,
  LayoutGrid,
  List,
  AlertTriangle,
  Layers,
  Check,
} from 'lucide-react';

const LOW_STOCK_THRESHOLD = 50;
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
  stock_quantity: number;
  discount_percentage: number;
  created_at: string;
  category: Category;
  sold_count: number;
}

interface ProductStats {
  total: number;
  in_stock: number;
  low_stock: number;
  out_of_stock: number;
  total_sold: number;
  catalogue_value: string;
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
  const [stockFilter, setStockFilter] = useState<'all' | 'in_stock' | 'low_stock' | 'out_of_stock'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'price_high' | 'price_low' | 'rating_high' | 'rating_low' | 'stock_low' | 'stock_high'>('newest');
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  // Category filter — leaf categories that have at least one product
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<string>(''); // '' = all categories
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);
  const [categorySearch, setCategorySearch] = useState('');

  // Stats locked at initial load — not affected by search or pagination
  const [stats, setStats] = useState<ProductStats | null>(null);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.category-menu-container') && !target.closest('.sort-menu-container')) {
        setShowCategoryMenu(false);
        setShowSortMenu(false);
      }
    };

    if (showCategoryMenu || showSortMenu) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showCategoryMenu, showSortMenu]);

  // Load leaf categories that have products (once)
  useEffect(() => {
    (async () => {
      try {
        const response = await authenticatedFetch('/categories/?leaf_only=true&with_products=true');
        if (!response.ok) return;
        const data = await response.json();
        setCategories(Array.isArray(data) ? data : data.results || []);
      } catch (err) {
        console.error('Failed to fetch categories:', err);
      }
    })();
  }, []);

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
  }, [currentPage, pageSize, debouncedSearch, stockFilter, categoryFilter, sortBy]);

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

      if (categoryFilter) {
        params.append('category', categoryFilter);
      }

      // Map UI sort options to backend ordering parameter
      const orderingMap: Record<string, string> = {
        newest: '-created_at',
        oldest: 'created_at',
        price_high: '-price',
        price_low: 'price',
        rating_high: '-rating',
        rating_low: 'rating',
        stock_low: 'stock_quantity',
        stock_high: '-stock_quantity',
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
  }, [currentPage, pageSize, debouncedSearch, stockFilter, categoryFilter, sortBy]);

  const totalPages = Math.ceil(totalCount / pageSize);

  // Stock health breakdown — share of the catalogue that is fully in stock
  const stockTotal = stats ? stats.in_stock + stats.low_stock + stats.out_of_stock : 0;
  const inStockPct = stockTotal > 0 ? Math.round((stats!.in_stock / stockTotal) * 100) : 0;

  // Format a Rand amount compactly: R2.51M, R12.4K, R940
  const formatRand = (value: number) => {
    if (value >= 1_000_000) return `R${(value / 1_000_000).toFixed(2)}M`;
    if (value >= 1_000) return `R${(value / 1_000).toFixed(1)}K`;
    return `R${Math.round(value)}`;
  };
  const catalogueValue = stats ? Number(stats.catalogue_value) : 0;

  // Active category name for the dropdown label
  const activeCategory = categories.find((c) => c.slug === categoryFilter);
  const filteredCategories = categorySearch.trim()
    ? categories.filter((c) => c.name.toLowerCase().includes(categorySearch.trim().toLowerCase()))
    : categories;

  // Stock tabs — counts come from the locked stats
  const stockTabs = [
    { value: 'all' as const, label: 'All', count: stats?.total },
    { value: 'in_stock' as const, label: 'In Stock', count: stats ? stats.in_stock + stats.low_stock : undefined },
    { value: 'low_stock' as const, label: 'Low Stock', count: stats?.low_stock },
    { value: 'out_of_stock' as const, label: 'Out of Stock', count: stats?.out_of_stock },
  ];

  const sortOptions = [
    { value: 'newest' as const, label: 'Date: Newest First' },
    { value: 'oldest' as const, label: 'Date: Oldest First' },
    { value: 'price_high' as const, label: 'Price: High to Low' },
    { value: 'price_low' as const, label: 'Price: Low to High' },
    { value: 'rating_high' as const, label: 'Rating: High to Low' },
    { value: 'rating_low' as const, label: 'Rating: Low to High' },
    { value: 'stock_low' as const, label: 'Stock: Low to High' },
    { value: 'stock_high' as const, label: 'Stock: High to Low' },
  ];

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

  // Stock status → label, color classes, and which dot/icon to show
  const getStockInfo = (qty: number) => {
    if (qty <= 0) {
      return { label: 'Out of Stock', cls: 'text-neg bg-neg/[.13] border border-neg/[.28]', low: false, out: true };
    }
    if (qty < LOW_STOCK_THRESHOLD) {
      return { label: 'Low Stock', cls: 'text-warn bg-warn/[.13] border border-warn/[.28]', low: true, out: false };
    }
    return { label: 'In Stock', cls: 'text-pos bg-pos/[.13] border border-pos/[.28]', low: false, out: false };
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6 lg:mb-8">
        {/* Stock Health — 2/3 width */}
        <div className="md:col-span-2 bg-panel border border-line rounded-card px-4 py-3.5 min-w-0">
          <div className="flex items-center justify-between mb-2.5">
            <span className="font-mono text-[10.5px] tracking-[.12em] uppercase text-mute">Stock Health</span>
            <CheckCircle2 size={14} className="text-pos" />
          </div>
          <p className="font-mono text-[26px] font-semibold text-pos tracking-[-.02em] leading-none">
            {stats ? `${inStockPct}% in stock` : '—'}
          </p>
          {/* Segmented bar: in stock / low / out */}
          <div className="mt-3 flex h-1.5 w-full overflow-hidden rounded-full bg-panel2">
            {stats && stockTotal > 0 && (
              <>
                <div className="bg-pos" style={{ width: `${(stats.in_stock / stockTotal) * 100}%` }} />
                <div className="bg-warn" style={{ width: `${(stats.low_stock / stockTotal) * 100}%` }} />
                <div className="bg-neg" style={{ width: `${(stats.out_of_stock / stockTotal) * 100}%` }} />
              </>
            )}
          </div>
          {/* Legend */}
          <div className="mt-2.5 flex flex-wrap items-center gap-x-3.5 gap-y-1 font-mono text-[11px] text-mute">
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-pos" />In stock {stats?.in_stock ?? '—'}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-warn" />Low {stats?.low_stock ?? '—'}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-neg" />Out {stats?.out_of_stock ?? '—'}
            </span>
          </div>
        </div>

        {/* Catalogue Value — 1/3 width */}
        <div className="bg-panel border border-line rounded-card px-4 py-3.5 min-w-0">
          <div className="flex items-center justify-between mb-2.5">
            <span className="font-mono text-[10.5px] tracking-[.12em] uppercase text-mute">Catalogue Value</span>
            <TrendingUp size={14} className="text-accent" />
          </div>
          <p className="font-mono text-[26px] font-semibold text-accent tracking-[-.02em] leading-none">
            {stats ? formatRand(catalogueValue) : '—'}
          </p>
          <p className="mt-2 font-mono text-[11px] text-mute">price × stock on hand</p>
        </div>
      </div>

      {/* Stock tabs → Category → Search + Sort + View
          Stacks on small screens; on screens wider than 1500px becomes two areas:
          [tabs + category] on the left, [search + sort + view] on the right */}
      <div className="mb-6 lg:mb-8 space-y-3 min-[1500px]:space-y-0 min-[1500px]:flex min-[1500px]:items-center min-[1500px]:justify-between min-[1500px]:gap-6">
        {/* Left area — stock tabs + category */}
        <div className="space-y-3 lg:space-y-0 lg:flex lg:items-center lg:gap-3 min-w-0">
        {/* Row 1 — stock status tabs */}
        <div className="flex sm:inline-flex lg:shrink-0 gap-[2px] bg-panel border border-line rounded-lg p-[3px] max-w-[450px] overflow-x-auto">
          {stockTabs.map(({ value, label, count }) => {
            const on = stockFilter === value;
            return (
              <button
                key={value}
                onClick={() => { setStockFilter(value); setCurrentPage(1); }}
                className={on
                  ? 'inline-flex items-center gap-[7px] px-3 py-1.5 rounded-md bg-panel2 text-body shadow-[inset_0_0_0_1px_rgb(var(--c-line))] font-mono text-[11.5px] font-semibold uppercase tracking-[.03em] whitespace-nowrap transition-colors'
                  : 'inline-flex items-center gap-[7px] px-3 py-1.5 rounded-md text-mute hover:text-dim font-mono text-[11.5px] font-semibold uppercase tracking-[.03em] whitespace-nowrap transition-colors'}
              >
                {label}
                {count != null && (
                  <span className={`text-[10.5px] font-bold rounded px-[5px] ${on ? 'text-accent bg-accent/15' : 'text-mute bg-panel2'}`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Row 2 — category dropdown */}
        <div className="relative category-menu-container lg:shrink-0">
          <button
            type="button"
            onClick={() => { setShowCategoryMenu((v) => !v); setCategorySearch(''); }}
            className={`inline-flex items-center justify-between gap-[7px] w-full sm:w-[280px] px-3 py-2 rounded-[7px] border text-[12.5px] font-bold transition ${
              showCategoryMenu || categoryFilter
                ? 'bg-panel2 text-body border-accent/40'
                : 'bg-panel text-dim border-line hover:border-line2 hover:text-body'
            }`}
          >
            <span className="inline-flex items-center gap-[7px] min-w-0">
              <Layers size={14} className="shrink-0" />
              <span className="truncate">{activeCategory ? activeCategory.name : 'All categories'}</span>
            </span>
            <ChevronDown size={14} className={`shrink-0 transition-transform ${showCategoryMenu ? 'rotate-180' : ''}`} />
          </button>
          {showCategoryMenu && (
            <div className="absolute left-0 mt-2 w-full sm:w-[280px] bg-panel border border-line rounded-card shadow-[0_20px_50px_-12px_rgba(0,0,0,.87)] z-20 animate-pop">
              {/* search inside dropdown */}
              <div className="p-2 border-b border-line">
                <div className="relative flex items-center">
                  <Search className="absolute left-2.5 text-mute pointer-events-none" size={13} />
                  <input
                    type="text"
                    autoFocus
                    placeholder="Filter categories…"
                    value={categorySearch}
                    onChange={(e) => setCategorySearch(e.target.value)}
                    className="w-full bg-panel2 border border-line rounded-[6px] pl-7 pr-2 py-1.5 text-[12px] text-body outline-none focus:border-accent/50 placeholder:text-mute"
                  />
                </div>
              </div>
              <div className="p-2 max-h-64 overflow-y-auto space-y-1">
                <button
                  onClick={() => { setCategoryFilter(''); setCurrentPage(1); setShowCategoryMenu(false); }}
                  className={`w-full flex items-center justify-between gap-2 text-left px-3 py-2 rounded-[7px] text-[12.5px] border transition-colors ${
                    categoryFilter === ''
                      ? 'bg-accent/15 text-accent border-accent/30'
                      : 'bg-panel2 text-dim border-transparent hover:text-body'
                  }`}
                >
                  All categories
                  {categoryFilter === '' && <Check size={14} className="shrink-0" />}
                </button>
                {filteredCategories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => { setCategoryFilter(cat.slug); setCurrentPage(1); setShowCategoryMenu(false); }}
                    className={`w-full flex items-center justify-between gap-2 text-left px-3 py-2 rounded-[7px] text-[12.5px] border transition-colors ${
                      categoryFilter === cat.slug
                        ? 'bg-accent/15 text-accent border-accent/30'
                        : 'bg-panel2 text-dim border-transparent hover:text-body'
                    }`}
                  >
                    <span className="truncate">{cat.name}</span>
                    {categoryFilter === cat.slug && <Check size={14} className="shrink-0" />}
                  </button>
                ))}
                {filteredCategories.length === 0 && (
                  <p className="px-3 py-3 text-center text-[12px] text-mute">No categories found</p>
                )}
              </div>
            </div>
          )}
        </div>
        </div>
        {/* end left area */}

        {/* Right area — search + sort + view toggle */}
        <div className="flex items-center gap-2.5 lg:shrink-0">
          <div className="flex-1 lg:flex-none lg:w-[280px] min-w-0 relative flex items-center">
            <Search className="absolute left-2.5 text-mute pointer-events-none" size={14} />
            <input
              type="text"
              placeholder="Search products…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-panel border border-line rounded-[7px] pl-8 pr-3 py-2 text-[12.5px] text-body outline-none focus:border-accent/50 placeholder:text-mute transition-colors"
            />
          </div>

          {/* Sort Menu */}
          <div className="relative sort-menu-container shrink-0">
            <button
              type="button"
              onClick={() => setShowSortMenu(!showSortMenu)}
              className={`inline-flex items-center justify-center gap-[7px] px-2.5 sm:px-3.5 py-2 rounded-[7px] border text-[12.5px] font-bold transition whitespace-nowrap ${
                showSortMenu || sortBy !== 'newest'
                  ? 'bg-panel2 text-body border-accent/40'
                  : 'bg-panel text-dim border-line hover:border-line2 hover:text-body'
              }`}
            >
              <ArrowUpDown size={14} />
              <span className="hidden sm:inline">Sort</span>
            </button>
            {showSortMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-panel border border-line rounded-card shadow-[0_20px_50px_-12px_rgba(0,0,0,.87)] z-20 animate-pop">
                <div className="p-3">
                  <label className="font-mono text-[10.5px] tracking-[.12em] uppercase text-mute mb-2 block">
                    Sort By
                  </label>
                  <div className="space-y-1.5">
                    {sortOptions.map(({ value, label }) => (
                      <button
                        key={value}
                        onClick={() => { setSortBy(value); setCurrentPage(1); setShowSortMenu(false); }}
                        className={`w-full text-left px-3 py-2 rounded-[7px] text-[12.5px] border transition-colors ${
                          sortBy === value
                            ? 'bg-accent/15 text-accent border-accent/30'
                            : 'bg-panel2 text-dim border-transparent hover:text-body'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* View toggle — list / grid */}
          <div className="inline-flex gap-[2px] bg-panel border border-line rounded-[7px] p-[3px] shrink-0">
            <button
              type="button"
              onClick={() => setViewMode('list')}
              title="List view"
              className={`inline-flex items-center justify-center w-8 h-8 rounded-[5px] transition-colors ${
                viewMode === 'list' ? 'bg-accent/15 text-accent' : 'text-mute hover:text-body'
              }`}
            >
              <List size={16} />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              title="Grid view"
              className={`inline-flex items-center justify-center w-8 h-8 rounded-[5px] transition-colors ${
                viewMode === 'grid' ? 'bg-accent/15 text-accent' : 'text-mute hover:text-body'
              }`}
            >
              <LayoutGrid size={16} />
            </button>
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
          {viewMode === 'grid' && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 mb-8">
            {products.map((product) => (
              <div
                key={product.id}
                className="group relative flex flex-col overflow-hidden rounded-card border border-line bg-panel transition-colors hover:border-line2"
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
                    {(() => {
                      const s = getStockInfo(product.stock_quantity);
                      const Icon = s.out ? XCircle : s.low ? AlertTriangle : CheckCircle2;
                      return (
                        <span className={`inline-flex items-center gap-[5px] font-mono text-[10px] font-semibold uppercase tracking-[.05em] px-2 py-[3px] rounded-[5px] bg-bg/70 backdrop-blur ${
                          s.out
                            ? 'text-neg border border-neg/[.28]'
                            : s.low
                            ? 'text-warn border border-warn/[.28]'
                            : 'text-pos border border-pos/[.28]'
                        }`}>
                          <Icon size={9} />
                          {s.out ? 'Out' : `${product.stock_quantity} left`}
                        </span>
                      );
                    })()}
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
          )}

          {/* Products List */}
          {viewMode === 'list' && (
          <div className="mb-8 overflow-hidden rounded-card border border-line bg-panel">
            {/* Header row (md+) */}
            <div className="hidden md:grid grid-cols-[1fr_110px_90px_120px_110px_120px_80px] gap-4 px-4 py-2.5 border-b border-line">
              {['Product', 'Rating', 'Sold', 'Price', 'Stock', 'Status', ''].map((h, i) => (
                <span key={i} className={`font-mono text-[9.5px] font-semibold uppercase tracking-[.12em] text-mute ${i === 0 ? '' : 'text-right'}`}>
                  {h}
                </span>
              ))}
            </div>

            {products.map((product) => {
              const s = getStockInfo(product.stock_quantity);
              return (
                <div
                  key={product.id}
                  className="group border-b border-line last:border-b-0 transition-colors hover:bg-panel2/40"
                >
                  <div className="flex items-center gap-2 sm:gap-4 px-3 sm:px-3.5 py-3 md:grid md:grid-cols-[1fr_110px_90px_120px_110px_120px_80px]">
                    {/* Product: image + name + category + badge/discount */}
                    <button
                      onClick={() => setSelectedProductId(product.id)}
                      className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1 text-left"
                    >
                      <div className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-[7px] overflow-hidden bg-panel2 border border-line shrink-0">
                        <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-mono text-[10px] tracking-[.1em] uppercase text-mute truncate">{product.category.name}</p>
                        <p className="text-[12.5px] font-semibold text-body leading-snug line-clamp-1 group-hover:text-accent transition-colors">{product.name}</p>
                        <div className="flex items-center gap-1.5 mt-1">
                          {product.badge && (
                            <span className={`inline-flex items-center font-mono text-[9px] font-semibold uppercase tracking-[.05em] px-1.5 py-px rounded-[4px] ${getBadgeStyle(product.badge)}`}>
                              {product.badge}
                            </span>
                          )}
                          {product.discount_percentage > 0 && (
                            <span className="inline-flex items-center font-mono text-[9px] font-bold px-1.5 py-px rounded-[4px] text-accent bg-accent/[.13] border border-accent/[.28]">
                              -{Math.round(product.discount_percentage)}%
                            </span>
                          )}
                        </div>
                      </div>
                    </button>

                    {/* Rating */}
                    <div className="hidden md:flex items-center justify-end gap-1">
                      {product.avg_rating > 0 ? (
                        <>
                          <Star size={11} className="fill-warn text-warn" />
                          <span className="font-mono text-[12px] font-bold text-warn">{product.avg_rating}</span>
                          <span className="font-mono text-[10.5px] text-mute">({product.total_reviews})</span>
                        </>
                      ) : (
                        <span className="font-mono text-[10.5px] text-mute">—</span>
                      )}
                    </div>

                    {/* Sold */}
                    <div className="hidden md:flex items-center justify-end gap-1">
                      <TrendingUp size={11} className="text-pos" />
                      <span className="font-mono text-[12.5px] font-semibold text-dim">{product.sold_count}</span>
                    </div>

                    {/* Price */}
                    <div className="hidden md:block text-right">
                      <span className="font-mono text-[13px] font-bold text-accent">R{product.price}</span>
                      {product.old_price && (
                        <span className="block font-mono text-[10.5px] line-through text-mute">R{product.old_price}</span>
                      )}
                    </div>

                    {/* Stock quantity */}
                    <div className="hidden md:block text-right">
                      <span className={`font-mono text-[13px] font-bold ${s.out ? 'text-neg' : s.low ? 'text-warn' : 'text-body'}`}>
                        {product.stock_quantity}
                      </span>
                      <span className="font-mono text-[10.5px] text-mute"> units</span>
                    </div>

                    {/* Status */}
                    <div className="hidden md:flex justify-end">
                      <span className={`inline-flex items-center gap-[5px] font-mono text-[10px] font-semibold uppercase tracking-[.05em] px-2 py-[3px] rounded-[5px] whitespace-nowrap ${s.cls}`}>
                        {s.out ? <XCircle size={9} /> : s.low ? <AlertTriangle size={9} /> : <CheckCircle2 size={9} />}
                        {s.label}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="hidden md:flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => setEditProductId(product.id)}
                        className="w-8 h-8 rounded-[7px] flex items-center justify-center bg-panel2 border border-line text-dim hover:text-accent hover:border-accent/40 transition-colors"
                        title="Edit product"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm({ id: product.id, name: product.name })}
                        className="w-8 h-8 rounded-[7px] flex items-center justify-center bg-panel2 border border-line text-dim hover:text-neg hover:border-neg/40 transition-colors"
                        title="Delete product"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                    {/* Mobile: rating + sold + price + stock + actions */}
                    <div className="flex md:hidden items-center gap-1.5 sm:gap-2.5 shrink-0">
                      <div className="text-right">
                        <span className="font-mono text-[12px] sm:text-[12.5px] font-bold text-accent">R{product.price}</span>
                        <span className={`block font-mono text-[10px] font-semibold ${s.out ? 'text-neg' : s.low ? 'text-warn' : 'text-pos'}`}>
                          {s.out ? 'Out' : `${product.stock_quantity} left`}
                        </span>
                        <span className="flex items-center justify-end gap-1.5 mt-0.5 font-mono text-[10px] text-mute">
                          {product.avg_rating > 0 && (
                            <span className="flex items-center gap-0.5">
                              <Star size={9} className="fill-warn text-warn" />{product.avg_rating}
                            </span>
                          )}
                          <span className="flex items-center gap-0.5">
                            <TrendingUp size={9} className="text-pos" />{product.sold_count}
                          </span>
                        </span>
                      </div>
                      <div className="flex items-center gap-1 sm:gap-1.5">
                        <button
                          onClick={() => setEditProductId(product.id)}
                          className="w-7 h-7 sm:w-8 sm:h-8 rounded-[7px] flex items-center justify-center bg-panel2 border border-line text-dim hover:text-accent transition-colors"
                          title="Edit product"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm({ id: product.id, name: product.name })}
                          className="w-7 h-7 sm:w-8 sm:h-8 rounded-[7px] flex items-center justify-center bg-panel2 border border-line text-dim hover:text-neg transition-colors"
                          title="Delete product"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          )}

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
                  className="w-8 h-8 rounded-[7px] flex items-center justify-center bg-panel border border-line text-dim hover:text-body hover:border-line2 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
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
                          : 'border border-line bg-panel text-dim hover:text-body hover:border-line2'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="w-8 h-8 rounded-[7px] flex items-center justify-center bg-panel border border-line text-dim hover:text-body hover:border-line2 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
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
                className="inline-flex items-center justify-center gap-[7px] px-3.5 py-2 text-[12.5px] font-bold rounded-[7px] bg-panel text-dim border border-line hover:border-line2 hover:text-body transition"
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
