import React, { useState, useEffect, useCallback } from 'react';
import { authenticatedFetch } from '../lib/api';
import {
  Plus,
  Edit2,
  Trash2,
  Package,
  Search,
  AlertCircle,
  Loader,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface Category {
  id: number;
  name: string;
  slug: string;
  is_leaf: boolean;
  product_count: number;
  children_count: number;
}

interface CategoryListResponse {
  count: number;
  page: number;
  page_size: number;
  results: Category[];
}

const Categories: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch categories whenever page, page size, or search changes
  useEffect(() => {
    fetchCategories();
  }, [currentPage, pageSize, debouncedSearch]);

  const fetchCategories = useCallback(async () => {
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

      const response = await authenticatedFetch(`/categories/admin/list/?${params}`);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText || 'Failed to fetch categories'}`);
      }

      const data: CategoryListResponse = await response.json();
      setCategories(data.results || []);
      setTotalCount(data.count || 0);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load categories';
      setError(message);
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, debouncedSearch]);

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <>
      <div className="mb-6 lg:mb-8">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2 tracking-tight">
          Categories
        </h1>
        <p className="text-sm sm:text-base text-gray-600 font-medium">
          Organize and manage product categories.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6 lg:mb-8">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
          <div className="flex items-center gap-1.5 mb-1">
            <Package size={14} className="text-blue-700" />
            <p className="text-xs text-blue-700 font-semibold">Total Categories</p>
          </div>
          <p className="text-xl lg:text-2xl font-bold text-blue-900">{totalCount}</p>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
          <div className="flex items-center gap-1.5 mb-1">
            <Package size={14} className="text-green-700" />
            <p className="text-xs text-green-700 font-semibold">Total Products</p>
          </div>
          <p className="text-xl lg:text-2xl font-bold text-green-900">
            {categories.reduce((sum: number, c: Category) => sum + c.product_count, 0)}
          </p>
        </div>
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 border border-orange-200">
          <div className="flex items-center gap-1.5 mb-1">
            <Package size={14} className="text-orange-700" />
            <p className="text-xs text-orange-700 font-semibold">Sub Categories</p>
          </div>
          <p className="text-xl lg:text-2xl font-bold text-orange-900">
            {categories.reduce((sum: number, c: Category) => sum + c.children_count, 0)}
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
              placeholder="Search categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-2.5 bg-white rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all text-sm"
            />
          </div>
          <button className="flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors whitespace-nowrap">
            <Plus size={18} />
            Add Category
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
          <p className="text-gray-600">Loading categories...</p>
        </div>
      ) : categories.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 text-lg">No categories found</p>
          {debouncedSearch && <p className="text-gray-500 text-sm mt-2">Try adjusting your search</p>}
        </div>
      ) : (
        <>
          {/* Categories Table */}
          <div className="space-y-2 mb-8">
            {categories.map((cat) => (
              <div key={cat.id} className="bg-white rounded-lg border border-gray-100 hover:shadow-md transition-all">
                <div className="px-4 sm:px-6 py-4 flex items-center gap-3 sm:gap-4">
                  {/* Icon & Name */}
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center text-lg flex-shrink-0">
                      📁
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-gray-900 truncate text-sm sm:text-base">
                        {cat.name}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5 truncate">{cat.slug}</p>
                    </div>
                  </div>

                  {/* Status badge */}
                  <span className="text-xs font-bold px-2.5 py-1.5 rounded-full whitespace-nowrap flex-shrink-0 bg-green-100 text-green-700">
                    {cat.is_leaf ? 'Leaf' : 'Parent'}
                  </span>

                  {/* Products & Children (hidden on mobile) */}
                  <div className="hidden sm:grid grid-cols-2 gap-4 px-4 flex-shrink-0 min-w-fit">
                    <div className="text-right">
                      <p className="text-xs text-gray-500 mb-0.5">Products</p>
                      <p className="text-sm font-bold text-gray-900">{cat.product_count}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500 mb-0.5">Sub Categories</p>
                      <p className="text-sm font-bold text-gray-900">{cat.children_count}</p>
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

                {/* Details row on mobile */}
                <div className="sm:hidden px-4 pb-3 flex gap-4 text-xs border-t border-gray-50">
                  <div>
                    <p className="text-gray-500 mb-1">Products</p>
                    <p className="font-bold text-gray-900">{cat.product_count}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 mb-1">Sub Categories</p>
                    <p className="font-bold text-gray-900">{cat.children_count}</p>
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
              <span className="font-semibold">{totalCount}</span> categories
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

export default Categories;
