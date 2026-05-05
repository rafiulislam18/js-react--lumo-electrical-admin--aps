import React, { useState, useEffect, useCallback } from 'react';
import { authenticatedFetch } from '../lib/api';
import {
  Truck,
  Phone,
  Mail,
  Plus,
  Trash2,
  AlertCircle,
  Loader,
  ChevronLeft,
  ChevronRight,
  Search,
  User,
} from 'lucide-react';
import CreateDeliveryPersonnelModal from '../components/CreateDeliveryPersonnelModal';

interface DeliveryPersonnel {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  created_at: string;
  is_active: boolean;
}

interface DeliveryPersonnelListResponse {
  count: number;
  page: number;
  page_size: number;
  results: DeliveryPersonnel[];
}

const DeliveryPersonnelPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [personnel, setPersonnel] = useState<DeliveryPersonnel[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch delivery personnel whenever page or search changes
  useEffect(() => {
    fetchPersonnel();
  }, [currentPage, pageSize, debouncedSearch, refreshTrigger]);

  const fetchPersonnel = useCallback(async () => {
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

      const response = await authenticatedFetch(`/users/admin/delivery-personnel/?${params}`);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText || 'Failed to fetch delivery personnel'}`);
      }

      const data: DeliveryPersonnelListResponse = await response.json();
      setPersonnel(data.results || []);
      setTotalCount(data.count || 0);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load delivery personnel';
      setError(message);
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, debouncedSearch]);

  const totalPages = Math.ceil(totalCount / pageSize);

  const handlePersonnelCreated = () => {
    setShowModal(false);
    setRefreshTrigger(prev => prev + 1);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: '2-digit',
    });
  };

  const activeCount = personnel.filter(p => p.is_active).length;
  const inactiveCount = personnel.filter(p => !p.is_active).length;

  return (
    <>
      <div className="mb-6 lg:mb-8">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2 tracking-tight">
          Delivery Personnel
        </h1>
        <p className="text-sm sm:text-base text-gray-600 font-medium">
          Manage your delivery team members.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6 lg:mb-8">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
          <div className="flex items-center gap-1.5 mb-1">
            <Truck size={14} className="text-blue-700" />
            <p className="text-xs text-blue-700 font-semibold">Total Personnel</p>
          </div>
          <p className="text-xl lg:text-2xl font-bold text-blue-900">{totalCount}</p>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
          <div className="flex items-center gap-1.5 mb-1">
            <User size={14} className="text-green-700" />
            <p className="text-xs text-green-700 font-semibold">Active</p>
          </div>
          <p className="text-xl lg:text-2xl font-bold text-green-900">{activeCount}</p>
        </div>
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 border border-orange-200">
          <div className="flex items-center gap-1.5 mb-1">
            <AlertCircle size={14} className="text-orange-700" />
            <p className="text-xs text-orange-700 font-semibold">Inactive</p>
          </div>
          <p className="text-xl lg:text-2xl font-bold text-orange-900">{inactiveCount}</p>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
          <div className="flex items-center gap-1.5 mb-1">
            <Phone size={14} className="text-purple-700" />
            <p className="text-xs text-purple-700 font-semibold">Contact Methods</p>
          </div>
          <p className="text-xl lg:text-2xl font-bold text-purple-900">{totalCount}</p>
        </div>
      </div>

      {/* Search and Add Button */}
      <div className="mb-6 lg:mb-8">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search by name, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-2.5 bg-white rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all text-sm"
            />
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors whitespace-nowrap"
          >
            <Plus size={18} />
            Add Personnel
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
          <p className="text-gray-600">Loading delivery personnel...</p>
        </div>
      ) : personnel.length === 0 ? (
        <div className="text-center py-12">
          <Truck className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p className="text-gray-600 text-lg">No delivery personnel found</p>
          {debouncedSearch && <p className="text-gray-500 text-sm mt-2">Try adjusting your search</p>}
        </div>
      ) : (
        <>
          {/* Personnel List */}
          <div className="space-y-3 mb-8">
            {personnel.map((person) => (
              <div key={person.id} className="bg-white rounded-lg border border-gray-100 overflow-hidden hover:shadow-md transition-all">
                <div className="p-4 flex flex-col sm:flex-row sm:items-center gap-4">
                  {/* Personnel Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-2 mb-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900">
                          {person.first_name} {person.last_name}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">ID: {person.id}</p>
                      </div>
                      <span
                        className={`text-xs font-bold px-2.5 py-1.5 rounded-full whitespace-nowrap flex-shrink-0 ${
                          person.is_active
                            ? 'bg-green-100 text-green-700 border border-green-300'
                            : 'bg-gray-100 text-gray-700 border border-gray-300'
                        }`}
                      >
                        {person.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div className="flex flex-col gap-1 text-xs text-gray-600">
                      <div className="flex items-center gap-2">
                        <Mail size={12} className="text-blue-600" />
                        {person.email}
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone size={12} className="text-blue-600" />
                        {person.phone}
                      </div>
                    </div>
                  </div>

                  {/* Join Date and Actions (hidden on mobile) */}
                  <div className="hidden sm:flex flex-col items-end gap-2">
                    <div className="text-right">
                      <p className="text-xs text-gray-500 mb-0.5">Joined</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {formatDate(person.created_at)}
                      </p>
                    </div>
                  </div>

                  {/* Delete Button */}
                  <button className="px-3 py-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>

                {/* Mobile Details */}
                <div className="sm:hidden px-4 pb-3 flex gap-4 text-xs border-t border-gray-50">
                  <div>
                    <p className="text-gray-500 mb-1">Joined</p>
                    <p className="font-bold text-gray-900">{formatDate(person.created_at)}</p>
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
              <span className="font-semibold">{totalCount}</span> personnel
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

      {/* Create Modal */}
      {showModal && (
        <CreateDeliveryPersonnelModal
          onClose={() => setShowModal(false)}
          onSuccess={handlePersonnelCreated}
        />
      )}
    </>
  );
};

export default DeliveryPersonnelPage;
